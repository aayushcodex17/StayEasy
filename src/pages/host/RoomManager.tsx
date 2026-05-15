import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, Pencil, Trash2, BedDouble, Users, X, Save } from 'lucide-react';
import { adminHotelsApi } from '../../api/hotels';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Room, RoomFormData, RoomType } from '../../types';
import { toast } from 'react-hot-toast';

const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY', 'STANDARD'];

const defaultRoomForm: RoomFormData = {
  type: 'STANDARD',
  name: '',
  description: '',
  pricePerNight: 0,
  capacity: 2,
  amenities: [],
  floorNumber: undefined,
  roomNumber: '',
};

function RoomFormModal({
  hotelId,
  room,
  onClose,
}: {
  hotelId: string;
  room?: Room;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RoomFormData>(
    room
      ? {
          type: room.type,
          name: room.name || '',
          description: room.description || '',
          pricePerNight: room.pricePerNight,
          capacity: room.capacity,
          amenities: room.amenities || [],
          floorNumber: room.floorNumber,
          roomNumber: room.roomNumber || '',
        }
      : defaultRoomForm
  );

  const createMutation = useMutation({
    mutationFn: (data: RoomFormData) => adminHotelsApi.createRoom(hotelId, data),
    onSuccess: () => {
      toast.success('Room added!');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms', hotelId] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add room.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<RoomFormData>) => adminHotelsApi.updateRoom(hotelId, room!.id, data),
    onSuccess: () => {
      toast.success('Room updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms', hotelId] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update room.'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pricePerNight <= 0) {
      toast.error('Price must be greater than 0.');
      return;
    }
    if (room) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-extrabold text-gray-900">{room ? 'Edit room' : 'Add new room'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Room type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as RoomType }))}
                className="input-field text-sm"
              >
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Room name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Deluxe King Room"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Room features and details…"
              rows={3}
              className="input-field text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Price/night (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.pricePerNight || ''}
                onChange={(e) => setForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))}
                placeholder="3500"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Max guests</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Floor number</label>
              <input
                type="number"
                min={0}
                value={form.floorNumber ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, floorNumber: Number(e.target.value) || undefined }))}
                placeholder="3"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Room number</label>
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                placeholder="301"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 py-2.5 text-sm">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="white" /> Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={14} /> {room ? 'Update' : 'Add room'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RoomManager() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['admin-rooms', hotelId],
    queryFn: () => adminHotelsApi.getRooms(hotelId!),
    enabled: !!hotelId,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => adminHotelsApi.deleteRoom(hotelId!, roomId),
    onSuccess: () => {
      toast.success('Room deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-rooms', hotelId] });
    },
    onError: () => toast.error('Could not delete room.'),
  });

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingRoom(undefined);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <Link
          to="/host"
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Manage rooms</h1>
            <p className="text-sm text-gray-500 mt-1">Hotel ID: {hotelId?.slice(-8)}</p>
          </div>
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-sm">
            <Plus size={16} />
            Add room
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Loading rooms…" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BedDouble size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">No rooms yet</h2>
            <p className="text-gray-500 mb-6">Add rooms to your hotel so guests can book them.</p>
            <button onClick={openCreate} className="btn-primary px-8 py-3 text-sm">
              <Plus size={16} /> Add first room
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BedDouble size={20} className="text-primary-red" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-gray-900">{room.name || room.type}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                          {room.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> Up to {room.capacity} guests
                        </span>
                        {room.floorNumber !== undefined && (
                          <span>Floor {room.floorNumber}</span>
                        )}
                        {room.roomNumber && (
                          <span>Room #{room.roomNumber}</span>
                        )}
                      </div>
                      {room.description && (
                        <p className="text-xs text-gray-500 mt-1.5 max-w-sm">{room.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right mr-2">
                      <p className="font-extrabold text-gray-900">₹{room.pricePerNight?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">per night</p>
                    </div>
                    <button
                      onClick={() => openEdit(room)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this room?')) deleteMutation.mutate(room.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {room.amenities.slice(0, 5).map((a) => (
                      <span key={a} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 5 && (
                      <span className="text-xs text-gray-400">+{room.amenities.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {modalOpen && (
        <RoomFormModal
          hotelId={hotelId!}
          room={editingRoom}
          onClose={() => { setModalOpen(false); setEditingRoom(undefined); }}
        />
      )}
    </div>
  );
}
