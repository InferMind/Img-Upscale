import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from backend.app import app

def handler(event, context):
    import json
    from io import StringIO
    
    # Simple routing for health check
    if event.get('path') == '/health':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ok'})
        }
    
    # For POST /api/enhance
    if event.get('httpMethod') == 'POST' and '/api/enhance' in event.get('path', ''):
        try:
            with app.test_client() as client:
                # Convert event to Flask test request
                response = client.post('/api/enhance', 
                    data=event.get('body', ''),
                    headers=event.get('headers', {}),
                    content_type=event.get('headers', {}).get('content-type', 'application/json')
                )
                
                return {
                    'statusCode': response.status_code,
                    'headers': dict(response.headers),
                    'body': response.get_data(as_text=True)
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Not found'})
    }