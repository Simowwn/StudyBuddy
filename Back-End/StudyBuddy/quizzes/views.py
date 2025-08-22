from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Quiz, Variant, Item
from .serializers import (QuizSerializer, VariantSerializer, ItemSerializer)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class VariantViewSet(viewsets.ModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

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
