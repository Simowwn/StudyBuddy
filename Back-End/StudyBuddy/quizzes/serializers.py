from rest_framework import serializers
from .models import Quiz, Variant, Item

class ItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(queryset=Variant.objects.all())
    variant_name = serializers.CharField(source="variant.name", read_only=True)

    class Meta:
        model = Item
        fields = ["id", "name", "variant", "variant_name"]

class VariantSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())
    items = ItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Variant
        fields = ["id", "name", "quiz", "items", "items_count"]
    
    def get_items_count(self, obj):
        return obj.items.count()

class QuizSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    user = serializers.ReadOnlyField(source='user.username')
    variants_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ["id", "title", "user", "created_at", "variants", "variants_count"]
    
    def get_variants_count(self, obj):
        return obj.variants.count()