# 📚 API Documentation

## Gateway Service

### Authentication
- `POST /auth/login` - User login
- `GET /api/user` - Get user profile

### Health Check
- `GET /health` - Service health status

## Billing Service

### Checkout
- `POST /checkout` - Create checkout session
- `POST /webhook` - Stripe webhook handler

## Content Service

### Content Generation
- `POST /generate` - Generate content with AI
- `GET /content/:id` - Get content by ID
- `GET /contents` - List contents

## Sales Service

### Leads
- `POST /leads` - Create lead
- `GET /leads` - List leads
- `PUT /leads/:id` - Update lead

### Deals
- `POST /deals` - Create deal
- `GET /deals` - List deals
