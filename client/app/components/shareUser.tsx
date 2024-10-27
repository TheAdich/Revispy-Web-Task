import React, { useState } from 'react';
import axios from 'axios';

interface User {
    username: string;
    email: string;
    id: string;
}

const ShareUser = ({ setShareUserPopup, userList, msgToShare, token,authUser }: { setShareUserPopup: any, userList: any, msgToShare: any, token: any,authUser:any }) => {


    const [checkedUsers, setCheckedUsers] = useState<User[]>([]);
    const [sharing,setSharing]=useState<boolean>(false)


    const handleUserToggle = (user: User) => {
        setCheckedUsers(prevUsers => {
            const isCurrentlyChecked = prevUsers.find(u => u.id === user.id);
            if (isCurrentlyChecked) {
                return prevUsers.filter(u => u.id !== user.id);
            } else {
                return [...prevUsers, user];
            }
        });
    };


    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {

        }
    };

    const handleSendShareMsg = async () => {
        setSharing(true);
        //console.log(msgToShare,checkedUsers)
        const instance = axios.create({
            baseURL: 'http://localhost:5000/api/msg',
            withCredentials: true,
            headers: {
                "Content-Type": 'application/json',
                "Accept": 'application/json',
                "Authorization": token
            }
        })
        try {
            const res=await instance.post('/shareMsg',{msg:msgToShare,sharedUsers:checkedUsers});
            //console.log(res.data);
            if(res.status===200){
                setShareUserPopup((prev:any)=>!prev);
            }

        }
        catch (err) {
            console.log(err);
        }
        finally{
            setSharing(false);
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            <div className="w-1/2 max-w-2xl bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-xl p-6 transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Select Users to Share With
                    </h2>
                    <button
                        onClick={() => setShareUserPopup((prev: any) => !prev)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userList.map((user: User) => (
                        <div
                            key={user.id}
                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
                        >
                            <label className="flex items-center space-x-4 w-full cursor-pointer">
                                <input
                                    type="checkbox"
                                    //   checked={checkedUsers.some(u => u.id === user.id)}
                                    onChange={() => handleUserToggle(user)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm text-black font-medium">
                                        {user.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {user.email}
                                    </span>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setShareUserPopup((prev: any) => !prev)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            console.log('Selected users:', checkedUsers);
                            handleSendShareMsg();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        {sharing ? "Sending...": "Forward"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareUser;