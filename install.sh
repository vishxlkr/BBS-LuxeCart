#!/bin/bash

# Install backend dependencies
mintty -e bash -c "cd server && npm install; exec bash" &

# Install frontend customer dependencies
mintty -e bash -c "cd frontend-customer && npm install; exec bash" &

# Install frontend admin dependencies
mintty -e bash -c "cd frontend-admin && npm install; exec bash" &
