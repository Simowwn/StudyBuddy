from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Quiz, Variant, Item

# Create your tests here.

class QuizModelTest(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(title="Test Quiz")

    def test_quiz_creation(self):
        self.assertEqual(self.quiz.title, "Test Quiz")
        self.assertIsNotNone(self.quiz.created_at)

class VariantModelTest(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(title="Test Quiz")
        self.variant = Variant.objects.create(name="Test Variant", quiz=self.quiz)

    def test_variant_creation(self):
        self.assertEqual(self.variant.name, "Test Variant")
        self.assertEqual(self.variant.quiz, self.quiz)

class ItemModelTest(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(title="Test Quiz")
        self.variant = Variant.objects.create(name="Test Variant", quiz=self.quiz)
        self.item = Item.objects.create(name="Test Item", variant=self.variant)

    def test_item_creation(self):
        self.assertEqual(self.item.name, "Test Item")
        self.assertEqual(self.item.variant, self.variant)

class CommaSeparatedItemsTest(APITestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(title="Test Quiz")
        self.variant = Variant.objects.create(name="Test Variant", quiz=self.quiz)

    def test_bulk_create_items(self):
        """Test creating multiple items using comma-separated values"""
        url = reverse('item-bulk-create')
        data = {
            'variant': self.variant.id,
            'names': 'Item 1, Item 2, Item 3'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Successfully created 3 items')
        self.assertEqual(len(response.data['items']), 3)
        
        # Verify items were created in database
        items = Item.objects.filter(variant=self.variant)
        self.assertEqual(items.count(), 3)
        self.assertTrue(items.filter(name='Item 1').exists())
        self.assertTrue(items.filter(name='Item 2').exists())
        self.assertTrue(items.filter(name='Item 3').exists())

    def test_create_variant_with_items(self):
        """Test creating a variant with comma-separated items"""
        url = reverse('variant-list')
        data = {
            'name': 'New Variant',
            'quiz': self.quiz.id,
            'comma_separated_items': 'New Item 1, New Item 2'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify variant was created
        variant = Variant.objects.get(name='New Variant')
        self.assertEqual(variant.quiz, self.quiz)
        
        # Verify items were created
        items = Item.objects.filter(variant=variant)
        self.assertEqual(items.count(), 2)
        self.assertTrue(items.filter(name='New Item 1').exists())
        self.assertTrue(items.filter(name='New Item 2').exists())
