"use client";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import { User } from "lucide-react";
import { useState } from "react";

export default function AdminBiodataPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const biodata = {
        nama: "Dea Pradestiawati",
        ttl: "Sumedang, 29 April 2005",
        jenisKelamin: "Perempuan",
        alamat: "Kp. BojongBolang dsn. Sukadana Kec. Cimanggung Kab. Sumedang",
        agama: "Islam",
        kewarganegaraan: "Indonesia",
        status: "Mahasiswa",
        kontak: "089656122902 / tiawatideaprades@gmail.com",
        hobi: "Menonton dan Membaca",
        skills: "Microsoft Excel / Word, Akuntansi Keuangan, Web Development, Kerja Sama Tim"
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="pt-24 px-4 flex justify-center items-start min-h-[calc(100vh-6rem)]">
                    <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-6 text-center">
                        {/* Foto profil */}
                        <div className="w-24 h-24 mx-auto relative">
                            <Image
                                src="/image/profile-default.jpeg"
                                alt="Foto"
                                fill
                                className="rounded-full object-cover border-2 border-blue-300"
                            />
                        </div>

                        {/* Nama dan role */}
                        <h2 className="mt-4 text-lg font-bold text-gray-700">{biodata.nama}</h2>
                        <p className="text-sm text-blue-500 flex items-center justify-center gap-1 mt-1">
                            <User className="w-4 h-4" />
                            Admin
                        </p>

                        {/* Info */}
                        <div className="mt-6 text-left space-y-2 text-sm text-gray-700">
                            <Info label="Tempat, Tgl Lahir" value={biodata.ttl} />
                            <Info label="Jenis Kelamin" value={biodata.jenisKelamin} />
                            <Info label="Alamat" value={biodata.alamat} />
                            <Info label="Agama" value={biodata.agama} />
                            <Info label="Kewarganegaraan" value={biodata.kewarganegaraan} />
                            <Info label="Status" value={biodata.status} />
                            <Info label="Kontak" value={biodata.kontak} />
                            <Info label="Hobi" value={biodata.hobi} />
                            <Info label="Skills" value={biodata.skills} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <span className="block text-[12px] text-gray-500 font-medium">{label}</span>
            <span className="block font-semibold">{value}</span>
        </div>
    );
}
