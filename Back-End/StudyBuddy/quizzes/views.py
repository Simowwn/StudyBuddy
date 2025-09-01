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

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    
    # def get_queryset(self):
    #     # Only return items of variants that belong to quizzes owned by the current user
    #     return Item.objects.filter(variant__quiz__user=self.request.user)
    def get_queryset(self):
        # Start with the base queryset (items belonging to the user's quizzes)
        queryset = Item.objects.filter(variant__quiz__user=self.request.user)

        # Check for a 'variant' query parameter
        variant_id = self.request.query_params.get('variant')
        if variant_id:
            # If the parameter exists, filter the queryset by the variant ID
            queryset = queryset.filter(variant__id=variant_id)
        
        return queryset    
    def create(self, request, *args, **kwargs):
        name_field = request.data.get("name", "")
        variant = request.data.get("variant")

        names = [n.strip() for n in name_field.split(",") if n.strip()]
        created_items = []

        for n in names:
            serializer = self.get_serializer(data={"name": n, "variant": variant})
            serializer.is_valid(raise_exception=True)
            item = serializer.save()
            created_items.append(serializer.data)

        return Response(created_items)
