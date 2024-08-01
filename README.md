# Calendar events register

## User stories

I am organising multiple events and would like to streamline the process of event creation,
participant registration, and checking participation status.

- As an event organiser, I would like to create new events, so that participants can register
  for them.
- As a participant, I would like to register for an event, so that I can attend it.
- As an event organiser, I would like to see a list of all participants for a specific event, so I
  can manage attendance.
- As a participant, I would like to see all events I am registered for, so I can keep track of
  my schedule.
- As an event organiser, I would like to limit the number of participants for an event, so
  that events do not exceed capacity.
- As an event organizer, I would like to cancel an event, so that participants
  are informed and do not attend.

## Development
### Local setup

Node v20 is required

1. `npm i`
2. Copy `.env.example` to `.env` and edit the variables in it

### Commands

1. `npm start` to build and run
2. `npm run dev` to run in hot reload mode
3. `npm test` to run tests
4. `npm run test:watch` to run tests in watch mode
5. `npm run test:e2e` to run end-to-end tests. You need to start the server first via `npm start` or `npm run dev`

## API

### POST `/user/register`
This endpoint does not require any authentication. All other endpoins should have HTTP header `Authorization: "Bearer <ACCESS_TOKEN>"`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "j.doe@test.com"
}
```
**Response:** ID of the new user and accsess token for authentication
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTgxNDg2ZC0wZTU3LTRmNDEtODk1ZC1kY2I4NDc0ODgyYWEiLCJpYXQiOjE3MjIwMDQ4NDIsImV4cCI6MTcyMjYwOTY0Mn0.3VzaT55vA-0KJONmDVyOQrlY3BJGG6pG6iVbcWgQHkI",
  "userId": "b181486d-0e57-4f41-895d-dcb8474882aa"
}
```

### POST `/event/create`
**Request:**
```json
{
  "title": "Birthday party",
  "start": "2024-07-26T14:50:17.179Z",
  "participants?": ["user-1-id", "user-2-id"],
  "capacity?": 10
}
```
**Response:** ID of the new event
```json
{
  "id": "f732ebbf-fa67-441e-9a79-61be2d68514a"
}
```

### POST `/event/:id/participate`

**Request:** No request body

**Response:** No response body, 201 code if okay

### GET `/event/:id/participants`

List participants of an event

**Response:**
```json
[
  { "id": "user-1-id", "fullName": "Alice" },
  { "id": "user-2-id", "fullName": "Bob" }
]
```

### GET `/user/events`

List events where the current user is a participant

**Response:**
```json
[
  { "id": "event-1-id", "title": "Event 1 title", "start": Date },
  { "id": "event-2-id", "title": "Event 2 title", "start": Date }
]
```

### POST `/event/:id/limit-capacity`

Limit the number of participants for an event, so that events do not exceed
capacity

**Request:**
```json
{ "capacity": number }
```

**Response:**
```json
{ "capacity": number }
```

### POST `/event/:id/cancel`

Change event's status to 'canceled' and send emails to each participant.

**Request:** No request body

**Response:**
```json
{
  "canceled": true,
  "allSent": boolean
}
```
