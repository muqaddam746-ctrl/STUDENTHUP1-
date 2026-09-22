import React, { useState, useMemo } from 'react';
import {
  Home,
  MapPin,
  Train,
  School,
  Phone,
  Send,
  Plus,
  Search,
  Filter,
  Users,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { HousingListing, Language, User } from '../types';
import { translations } from '../i18n/translations';

interface StudentHousingProps {
  language: Language;
  currentUser: User | null;
  housingListings: HousingListing[];
  onAddHousing: (housing: Omit<HousingListing, 'id' | 'createdAt'>) => void;
  onOpenAuth: () => void;
}

export const StudentHousing: React.FC<StudentHousingProps> = ({
  language,
  currentUser,
  housingListings,
  onAddHousing,
  onOpenAuth,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [activeHousingModal, setActiveHousingModal] = useState<HousingListing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New housing state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<HousingListing['type']>('apartment');
  const [newPrice, setNewPrice] = useState(1500000);
  const [newDistrict, setNewDistrict] = useState('Olmazor');
  const [newAddress, setNewAddress] = useState('Beruniy metrosi yaqinida');
  const [newGender, setNewGender] = useState<HousingListing['genderPreference']>('any');
  const [newDistanceUni, setNewDistanceUni] = useState('TATUga 10 daqiqa piyoda');
  const [newDistanceMetro, setNewDistanceMetro] = useState('Metro Beruniy - 350 m');
  const [newPhone, setNewPhone] = useState('+998 90 123 45 67');
  const [newTelegram, setNewTelegram] = useState('@uy_egasi');
  const [newDesc, setNewDesc] = useState('');

  const filteredHousing = useMemo(() => {
    return housingListings.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'all' || h.type === selectedType;
      const matchDistrict = selectedDistrict === 'all' || h.district === selectedDistrict;
      const matchGender = selectedGender === 'all' || h.genderPreference === selectedGender;

      return matchSearch && matchType && matchDistrict && matchGender;
    });
  }, [housingListings, searchQuery, selectedType, selectedDistrict, selectedGender]);

  const handleCreateHousing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onAddHousing({
      title: newTitle,
      type: newType,
      price: newPrice,
      currency: 'UZS',
      district: newDistrict,
      address: newAddress,
      distanceToUniversity: newDistanceUni,
      distanceToMetro: newDistanceMetro,
      genderPreference: newGender,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
      ],
      amenities: ['Wi-Fi internet', 'Kir yuvish mashinasi', 'Muzlatgich', 'Isitish tizimi'],
      contactPhone: newPhone,
      contactTelegram: newTelegram,
      description: newDesc,
      ownerName: currentUser.name,
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.housing.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.housing.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.housing.postHousing}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tuman, metro yoki ko‘cha nomi bo‘yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'apartment', label: t.housing.apartments },
            { id: 'room', label: t.housing.rooms },
            { id: 'dormitory', label: t.housing.dormitories },
            { id: 'hostel', label: t.housing.hostels },
          ].map((tp) => (
            <button
              key={tp.id}
              onClick={() => setSelectedType(tp.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedType === tp.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {tp.label}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700 hidden sm:block mx-1" />

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha jinslar uchun</option>
            <option value="boys">{t.housing.boys}</option>
            <option value="girls">{t.housing.girls}</option>
            <option value="any">Farqi yo‘q</option>
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-none focus:outline-none cursor-pointer"
          >
            <option value="all">Barcha tumanlar</option>
            <option value="Olmazor">Olmazor tumani</option>
            <option value="Yunusobod">Yunusobod tumani</option>
            <option value="Chilonzor">Chilonzor tumani</option>
            <option value="Mirzo Ulug‘bek">Mirzo Ulug‘bek tumani</option>
            <option value="Yakkasaroy">Yakkasaroy tumani</option>
          </select>
        </div>
      </div>

      {/* Housing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHousing.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            Tanlangan mezonlarga mos uylar topilmadi.
          </div>
        ) : (
          filteredHousing.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveHousingModal(item)}
              className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-white">
                      {item.type === 'apartment'
                        ? 'Kvartira'
                        : item.type === 'room'
                        ? 'Xona'
                        : item.type === 'dormitory'
                        ? 'Talabalar uyi'
                        : 'Hostel'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        item.genderPreference === 'girls'
                          ? 'bg-pink-600/90 text-white'
                          : item.genderPreference === 'boys'
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {item.genderPreference === 'girls'
                        ? 'Qizlar uchun'
                        : item.genderPreference === 'boys'
                        ? 'O‘g‘il bolalar'
                        : 'Ixtiyoriy'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {item.price.toLocaleString()} UZS
                      <span className="text-xs font-normal text-neutral-400"> / oy</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-400">{item.district}</span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="line-clamp-1">{item.distanceToUniversity}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{item.distanceToMetro}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 truncate max-w-[130px]">{item.ownerName}</span>
                <button className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors">
                  Batafsil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Housing Detail Modal */}
      {activeHousingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {/* Modal Image */}
            <div className="relative h-56 w-full bg-neutral-100">
              <img
                src={activeHousingModal.images[0]}
                alt={activeHousingModal.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveHousingModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/60 text-white hover:bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {activeHousingModal.district} • {activeHousingModal.type.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                    {activeHousingModal.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {activeHousingModal.price.toLocaleString()} UZS
                  </span>
                  <span className="text-xs text-neutral-400 block">oyiga</span>
                </div>
              </div>

              {/* Location details */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>Aniq manzil: {activeHousingModal.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-500" />
                  <span>OTMgacha: {activeHousingModal.distanceToUniversity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-emerald-500" />
                  <span>Metrogacha: {activeHousingModal.distanceToMetro}</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Mavjud qulayliklar:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeHousingModal.amenities.map((am, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{am}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Batafsil ma’lumot:
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {activeHousingModal.description}
                </p>
              </div>

              {/* Contact actions */}
              <div className="pt-2 flex gap-3">
                <a
                  href={`tel:${activeHousingModal.contactPhone}`}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>Qo‘ng‘iroq: {activeHousingModal.contactPhone}</span>
                </a>
                {activeHousingModal.contactTelegram && (
                  <a
                    href={`https://t.me/${activeHousingModal.contactTelegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Housing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <span>{t.housing.postHousing}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHousing} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  E’lon sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: TATU yaqinida 2 xonali toza kvartira"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Uy turi
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="apartment">Kvartira</option>
                    <option value="room">Xona</option>
                    <option value="dormitory">Talabalar uyi</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kimlar uchun
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="boys">O‘g‘il bolalar</option>
                    <option value="girls">Qizlar</option>
                    <option value="any">Farqi yo‘q</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Narxi (so‘m/oy)
                  </label>
                  <input
                    type="number"
                    step={50000}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tuman
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="Olmazor"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Aniq manzil
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Beruniy shoh ko‘chasi, 12-uy"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={newTelegram}
                    onChange={(e) => setNewTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqacha tavsif
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Uy sharoitlari, qulayliklar..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  E’lonni joylashtirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
