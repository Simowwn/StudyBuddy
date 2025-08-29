from django.contrib.auth.models import User
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import LoginSerializer, UsersSerializer, RegisterSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsersSerializer

class RegisterView(APIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request):
        logger.info(f"Register request received: {request.method} from {request.META.get('HTTP_ORIGIN', 'Unknown')}")
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UsersSerializer(user).data, status=status.HTTP_201_CREATED)
        logger.error(f"Registration failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight"""
        response = Response()
        response["Allow"] = "POST, OPTIONS"
        return response


class LoginView(APIView):
    serializer_class = LoginSerializer  # <-- this enables DRF browsable API form

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight"""
        response = Response()
        response["Allow"] = "POST, OPTIONS"
        return response



