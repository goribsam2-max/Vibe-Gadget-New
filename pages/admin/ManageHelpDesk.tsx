import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNotify } from '../../components/Notifications';

const ManageHelpDesk: React.FC = () => {
    const navigate = useNavigate();
    const notify = useNotify();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'helpdesk'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'helpdesk', id), { status: newStatus, updatedAt: Date.now() });
            notify(`Ticket marked as ${newStatus}`, 'success');
            fetchTickets();
        } catch (e) {
            notify("Error updating ticket", 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 pb-32 min-h-screen bg-zinc-50/50">
            <div className="flex items-center space-x-6 mb-12">
                <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95">
                    <i className="fas fa-arrow-left text-xs"></i>
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 mb-1">Help Desk</h1>
                    <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Support Tickets</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden text-sm">
                {loading ? (
                    <div className="py-20 text-center"><i className="fas fa-spinner fa-spin text-emerald-500 text-3xl"></i></div>
                ) : tickets.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50/80 border-b border-zinc-200">
                            <tr>
                                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Ticket ID</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-zinc-500">User / Contact</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Issue</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Status</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-5 font-mono text-xs text-zinc-500">#{t.id.slice(0, 6)}</td>
                                    <td className="p-5">
                                        <div className="font-bold text-zinc-900">{t.userName || 'Unknown User'}</div>
                                        <div className="text-[10px] text-zinc-400 font-medium">{t.userEmail}</div>
                                    </td>
                                    <td className="p-5 max-w-[300px]">
                                        <div className="font-bold text-zinc-800 text-xs mb-1 truncate">{t.subject}</div>
                                        <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{t.message}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${t.status === 'Open' ? 'bg-orange-100 text-orange-600' : t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                            {t.status || 'Open'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <select 
                                            value={t.status || 'Open'}
                                            onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                                            className="bg-zinc-50 border border-zinc-200 text-xs font-bold p-2.5 rounded-xl cursor-pointer hover:border-zinc-300 focus:outline-none"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-24 text-center text-zinc-400">
                        <i className="fas fa-inbox text-4xl mb-4 text-zinc-300"></i>
                        <p className="font-bold text-xs uppercase tracking-widest">No active tickets</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageHelpDesk;
