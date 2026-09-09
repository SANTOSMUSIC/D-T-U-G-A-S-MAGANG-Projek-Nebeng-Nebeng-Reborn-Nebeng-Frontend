import apiClient from './apiClient';
import { getRegionId } from '../utils/regionId';
import { getAssignedPos } from '../utils/posId';

export async function loginRequest({ email, password }) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi');
  }

  const response = await apiClient.post('/auth/login', {
    email: email.trim(),
    password,
  });

  const responseData = response.data;

  // Mendukung berbagai struktur respons nested dari backend NestJS
  const userObj = responseData?.data?.user || responseData?.user || responseData?.data || responseData;
  const role = userObj?.role || responseData?.role || 'customer';
  
  // Memastikan pencarian token mencakup standar umum REST API
  const accessToken = 
    responseData?.accessToken || 
    responseData?.token || 
    responseData?.data?.accessToken || 
    responseData?.data?.token || 
    userObj?.token;

  const refreshToken = 
    responseData?.refreshToken || 
    responseData?.refresh_token || 
    responseData?.data?.refreshToken || 
    userObj?.refreshToken;

  if (!accessToken) {
    throw new Error('Token otentikasi tidak ditemukan dari server');
  }

  // FIX: sebelumnya field ini (khususnya regionId) tidak pernah diambil
  // dari response login, padahal untuk role 'regional'/'operator' backend
  // mengirimkan regionId (kadang dibungkus sebagai object `region`) yang
  // dipakai di seluruh panel regional untuk memfilter data sesuai wilayah
  // admin yang login (lihat PosMitraManagement.jsx, dst). Karena tidak
  // pernah tersimpan, setiap request ke backend selalu tanpa regionId dan
  // data dari wilayah lain ikut ditampilkan. Sekarang seluruh identitas
  // user (termasuk regionId) dikembalikan sebagai object `user` supaya
  // bisa disimpan utuh ke sesi oleh Login.jsx.
  const regionId = getRegionId(userObj);
  const regionName = userObj?.region?.name ?? userObj?.regionName ?? null;

  // FIX: sama seperti regionId di atas, tapi untuk Pos tempat seorang
  // Operator Pos ditugaskan (lihat utils/posId.js). Tanpa ini, layar
  // Operator (Dual Scanner/Inspection/Handover) tidak tahu pos resmi
  // operator yang login, sehingga field "ID Pos Bertugas" jadi input
  // bebas yang bisa diisi ID pos manapun oleh operator.
  const { id: posId, name: posName } = getAssignedPos(userObj);

  return {
    role: role.toLowerCase(),
    token: accessToken,
    refreshToken: refreshToken,
    email: userObj?.email || email,
    name: userObj?.name,
    user: {
      id: userObj?.id ?? null,
      name: userObj?.name ?? null,
      email: userObj?.email || email,
      phone: userObj?.phone ?? null,
      role: role.toLowerCase(),
      regionId,
      regionName,
      posId,
      posName,
    },
  };
}

export async function registerRequest(payload) {
  if (!payload?.email || !payload?.password || !payload?.name) {
    throw new Error('Data pendaftaran tidak lengkap');
  }

  // Hanya mengirim properti yang diizinkan oleh RegisterDto backend
  const backendPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone,
    password: payload.password,
    role: payload.role ? payload.role.toLowerCase() : 'customer',
    regionId: payload.regionId ? String(payload.regionId) : undefined,
  };

  const response = await apiClient.post('/auth/register', backendPayload);

  return {
    success: true,
    data: response.data,
  };
}