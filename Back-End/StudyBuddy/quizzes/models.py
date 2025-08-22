from django.db import models

# Create your models here.
class Quiz(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Variant(models.Model):
    quiz = models.ForeignKey(Quiz, related_name="variants", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.quiz.title})"

class Item(models.Model):
    variant = models.ForeignKey(Variant, related_name="items", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name