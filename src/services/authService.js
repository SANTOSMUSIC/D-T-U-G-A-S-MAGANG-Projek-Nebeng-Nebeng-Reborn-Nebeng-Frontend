import apiClient from './apiClient';

export async function loginRequest({ email, password }) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi');
  }

  const response = await apiClient.post('/auth/login', {
    email: email.trim(),
    password,
  });

  const responseData = response.data;
  const userObj = responseData?.data || responseData?.user || responseData;

  const role = userObj?.role || responseData?.role || 'customer';
  const token = responseData?.accessToken || responseData?.token || userObj?.token;

  return {
    role: role.toLowerCase(), // Langsung menggunakan role dari backend ('admin', 'regional', dll)
    token: token,             // Token JWT asli dari backend
    email: userObj?.email || email,
    name: userObj?.name,
  };
}

export async function registerRequest(payload) {
  if (!payload?.email || !payload?.password || !payload?.name) {
    throw new Error('Data pendaftaran tidak lengkap');
  }

  const backendPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone,
    password: payload.password,
    role: payload.role ? payload.role.toLowerCase() : 'customer',
  };

  const response = await apiClient.post('/auth/register', backendPayload);

  return {
    success: true,
    data: response.data,
  };
}