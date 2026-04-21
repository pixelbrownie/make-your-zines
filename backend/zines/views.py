from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Zine
from .serializers import ZineSerializer
from django.contrib.auth.models import User
from django.db import models
from rest_framework.permissions import AllowAny, IsAuthenticated

class ZineViewSet(viewsets.ModelViewSet):
    queryset = Zine.objects.all()
    serializer_class = ZineSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Zine.objects.all()
        # If accessing the 'mine' action, filter by owner
        if self.action == 'mine':
            return queryset.filter(owner=self.request.user)
        # For general list, show only public zines if not authenticated
        if not self.request.user.is_authenticated:
            return queryset.filter(is_public=True)
        # If authenticated, show public ones + user's own ones
        return queryset.filter(models.Q(is_public=True) | models.Q(owner=self.request.user)).distinct()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        zines = self.get_queryset()
        serializer = self.get_serializer(zines, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
