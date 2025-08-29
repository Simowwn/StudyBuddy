from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin

class CustomCORSMiddleware(MiddlewareMixin):
    ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://mindly-simowwn.vercel.app',
    ]

    def process_request(self, request):
        if request.method == 'OPTIONS':
            origin = request.headers.get('Origin')
            if origin in self.ALLOWED_ORIGINS:
                response = HttpResponse()
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Max-Age'] = '86400'
                return response
        return None

    def process_response(self, request, response):
        origin = request.headers.get('Origin')
        if origin in self.ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        return response

