from rest_framework import serializers
from .models import Quiz, Variant, Item

# class ItemSerializer(serializers.ModelSerializer):
#     variant = serializers.PrimaryKeyRelatedField(queryset=Variant.objects.all())  # dropdown for create
class ItemSerializer(serializers.ModelSerializer):
    variant = serializers.PrimaryKeyRelatedField(queryset=Variant.objects.all())
    variant_name = serializers.CharField(source="variant.name", read_only=True)

    class Meta:
        model = Item
        fields = ["id", "name", "variant", "variant_name"]


    class Meta:
        model = Item
        fields = ["id", "name", "variant", "variant_detail"]

    class Meta:
        model = Item
        fields = ["id", "name", "variant"]


class VariantSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())  # dropdown for create
    items = ItemSerializer(many=True, read_only=True)  # nested for GET

    class Meta:
        model = Variant
        fields = ["id", "name", "quiz", "items"]


class QuizSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)  # nested for GET
    user = serializers.ReadOnlyField(source='user.username')  # Show username, read-only

    class Meta:
        model = Quiz
        fields = ["id", "title", "user", "created_at", "variants"]
