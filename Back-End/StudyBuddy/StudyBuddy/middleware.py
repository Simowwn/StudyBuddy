from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin

class CustomCORSMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = 'https://mindly-simowwn.vercel.app'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            return response
        return None

    def process_response(self, request, response):
        # Add CORS headers to all responses
        if request.method != 'OPTIONS':
            response['Access-Control-Allow-Origin'] = 'https://mindly-simowwn.vercel.app'
            response['Access-Control-Allow-Credentials'] = 'true'
        return response
