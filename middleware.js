import { NextResponse } from 'next/server';

const adminPaths = [
  '/dashboard/admin',
  '/dashboard/admin/',
  '/dashboard/admin/supplier',
  '/dashboard/admin/stok-masuk',
  '/dashboard/admin/stok-keluar',
  '/dashboard/admin/laporan-mingguan',
  '/dashboard/admin/notifikasi',
];

const managerPaths = [
  '/dashboard/manager',
  '/dashboard/manager/',
  '/dashboard/manager/buku',
  '/dashboard/manager/kategori',
  '/dashboard/manager/supplier',
  '/dashboard/manager/stok-masuk',
  '/dashboard/manager/stok-keluar',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();

  const userCookie = request.cookies.get('user');
  let user = {};
  try {
    user = userCookie ? JSON.parse(userCookie.value) : {};
  } catch {
    user = {};
  }

  if (!user.role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (
    user.role === 'manager' &&
    adminPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL('/dashboard/manager', request.url));
  }

  if (
    user.role === 'admin' &&
    managerPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};