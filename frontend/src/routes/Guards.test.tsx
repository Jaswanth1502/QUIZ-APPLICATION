import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AdminRoute, ProtectedRoute } from './Guards';

let auth = {user:null as any,loading:false};
vi.mock('../context/AuthContext',()=>({useAuth:()=>auth}));

describe('route guards',()=>{
  it('redirects anonymous visitors to login',()=>{
    auth={user:null,loading:false};
    render(<MemoryRouter initialEntries={['/dashboard']}><Routes>
      <Route element={<ProtectedRoute/>}><Route path="/dashboard" element={<div>Private</div>}/></Route>
      <Route path="/login" element={<div>Login page</div>}/>
    </Routes></MemoryRouter>);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('allows administrators through the admin guard',()=>{
    auth={user:{roles:['ROLE_ADMIN']},loading:false};
    render(<MemoryRouter initialEntries={['/admin']}><Routes>
      <Route element={<AdminRoute/>}><Route path="/admin" element={<div>Admin area</div>}/></Route>
      <Route path="/unauthorized" element={<div>Denied</div>}/>
    </Routes></MemoryRouter>);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });
});
