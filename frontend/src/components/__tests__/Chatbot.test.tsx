import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Chatbot, { validateMessageInput } from '../Chatbot';

describe('Chatbot Component', () => {
    describe('Unit Tests: validateMessageInput', () => {
        it('returns true for valid input', () => {
            expect(validateMessageInput('Hello World')).toBe(true);
            expect(validateMessageInput('  Valid string  ')).toBe(true);
        });

        it('returns false for invalid (empty) input', () => {
            expect(validateMessageInput('')).toBe(false);
            expect(validateMessageInput('   ')).toBe(false);
        });
    });

    describe('Integration Tests: Chatbot interaction', () => {
        it('shows error when sending an empty message', () => {
            render(<Chatbot />);

            const input = screen.getByPlaceholderText('Type a message');
            const sendButton = screen.getByTestId('send-button');

            fireEvent.change(input, { target: { value: '   ' } });
            fireEvent.click(sendButton);

            expect(screen.getByTestId('error-message')).toHaveTextContent('Message cannot be empty.');
        });

        it('submits a valid message, displays it, and simulates a mock response', async () => {
            jest.useFakeTimers();
            render(<Chatbot />);

            const input = screen.getByPlaceholderText('Type a message');
            const sendButton = screen.getByTestId('send-button');

            fireEvent.change(input, { target: { value: 'Hello AI' } });
            fireEvent.click(sendButton);

            // User message should appear immediately
            expect(screen.getByText('Hello AI')).toBeInTheDocument();
            expect(input).toHaveValue(''); // Input should be cleared

            // Loading state should be true
            expect(screen.getByText('Typing...')).toBeInTheDocument();

            // Fast-forward timers for mock response
            act(() => {
                jest.runAllTimers();
            });

            // Mock response should appear
            await waitFor(() => {
                expect(screen.getByText('This is a mocked AI response.')).toBeInTheDocument();
            });

            // Loading state should be gone
            expect(screen.queryByText('Typing...')).not.toBeInTheDocument();

            jest.useRealTimers();
        });
    });
});
