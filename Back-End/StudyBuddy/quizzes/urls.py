from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'variants', views.VariantViewSet, basename='variant')
router.register(r'items', views.ItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]