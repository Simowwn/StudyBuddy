from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Quiz, Variant, Item
from .serializers import (QuizSerializer, VariantSerializer, ItemSerializer)

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return quizzes created by the current user
        return Quiz.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set the user to the current authenticated user
        serializer.save(user=self.request.user)

class VariantViewSet(viewsets.ModelViewSet):
    serializer_class = VariantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return variants of quizzes owned by the current user
        return Variant.objects.filter(quiz__user=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure the variant is created for a quiz owned by the current user
        serializer.save()

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Start with the base queryset (items belonging to the user's quizzes)
        queryset = Item.objects.filter(variant__quiz__user=self.request.user)

        # Check for a 'variant' query parameter to filter by specific variant
        variant_id = self.request.query_params.get('variant')
        if variant_id:
            try:
                # Validate that the variant exists and belongs to the user
                variant = Variant.objects.get(id=variant_id, quiz__user=self.request.user)
                queryset = queryset.filter(variant=variant)
            except Variant.DoesNotExist:
                # Return empty queryset if variant doesn't exist or doesn't belong to user
                queryset = queryset.none()
        
        return queryset
    
    def get_serializer(self, *args, **kwargs):
        # Override to limit variant choices to user's variants only
        serializer = super().get_serializer(*args, **kwargs)
        if hasattr(serializer, 'fields') and 'variant' in serializer.fields:
            serializer.fields['variant'].queryset = Variant.objects.filter(
                quiz__user=self.request.user
            )
        return serializer
    
    def create(self, request, *args, **kwargs):
        name_field = request.data.get("name", "")
        variant_id = request.data.get("variant")
        
        # Validate that the variant belongs to the current user
        try:
            variant = Variant.objects.get(id=variant_id, quiz__user=request.user)
        except Variant.DoesNotExist:
            return Response(
                {"error": "Variant not found or you don't have permission to add items to it."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        names = [n.strip() for n in name_field.split(",") if n.strip()]
        created_items = []

        for name in names:
            serializer = self.get_serializer(data={"name": name, "variant": variant_id})
            serializer.is_valid(raise_exception=True)
            item = serializer.save()
            created_items.append(serializer.data)

        return Response(created_items, status=status.HTTP_201_CREATED)
