import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { RegisterPage } from './AuthPages';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ register: vi.fn() })
}));

describe('registration validation', () => {
  it('rejects mismatched passwords before submission', async () => {
    render(<MemoryRouter><RegisterPage/></MemoryRouter>);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Username'), 'tester');
    await user.type(screen.getByLabelText('Email'), 'tester@example.com');
    await user.type(screen.getByLabelText((_, element) => element?.getAttribute('name') === 'password'), 'Password1');
    await user.type(screen.getByLabelText('Confirm password'), 'Password2');
    await user.click(screen.getByRole('button',{name:'Register'}));
    expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
  });
});
