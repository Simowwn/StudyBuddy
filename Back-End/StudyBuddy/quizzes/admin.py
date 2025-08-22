from django.contrib import admin
from .models import Quiz, Variant, Item

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    search_fields = ['title']

@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    list_display = ['name', 'quiz']
    list_filter = ['quiz']
    search_fields = ['name']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'variant', 'variant__quiz']
    list_filter = ['variant__quiz', 'variant']
    search_fields = ['name']
    
    def variant__quiz(self, obj):
        return obj.variant.quiz.title
    variant__quiz.short_description = 'Quiz'


