import { create } from 'zustand';

export type PageType =
  | 'dashboard'
  | 'antrian'
  | 'pendaftaran'
  | 'informasi'
  | 'status-antrian'
  | 'login-petugas'
  | 'petugas-dashboard'
  | 'petugas-detail'
  | 'display-antrian'
  | 'rekapitulasi';

interface Officer {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface SipekanState {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;

  officer: Officer | null;
  setOfficer: (officer: Officer | null) => void;

  selectedRegistrationId: string | null;
  setSelectedRegistrationId: (id: string | null) => void;

  lastQueueNumber: string | null;
  setLastQueueNumber: (num: string | null) => void;
}

export const useSipekanStore = create<SipekanState>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  officer: null,
  setOfficer: (officer) => set({ officer }),

  selectedRegistrationId: null,
  setSelectedRegistrationId: (id) => set({ selectedRegistrationId: id }),

  lastQueueNumber: null,
  setLastQueueNumber: (num) => set({ lastQueueNumber: num }),
}));
