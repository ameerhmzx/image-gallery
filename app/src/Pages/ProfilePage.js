import {useContext, useEffect, useState} from "react";
import LoadingContext from "../Context/LoadingContext";
import {UserIcon, AtSymbolIcon} from "@heroicons/react/solid";
import {PencilIcon} from "@heroicons/react/outline";
import ToastContext from "../Context/ToastContext";


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+$/.test(email.toLowerCase())
}

export default function ProfilePage() {

    let [profile, setProfile] = useState({});
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);
    let [isUpdated, setUpdated] = useState(false);

    const handleNameChange = function (e) {
        let newState = {...profile};
        newState.name = e.target.value;
        setUpdated(true);
        if (newState.name === '')
            newState.err_name = 'Name Cannot be empty!';
        else
            newState.err_name = undefined;
        setProfile(newState);
    };

    const handleEmailChange = function (e) {
        let newState = {...profile};
        newState.email = e.target.value;
        setUpdated(true);
        if (newState.email === '' || !isValidEmail(newState.email))
            newState.err_email = 'Email must be valid!';
        else
            newState.err_email = undefined;
        setProfile(newState);
    };

    const handleProfileForm = function (e) {
        e.preventDefault();
        if (isUpdated && profile.name && profile.name.length > 0 && profile.email && isValidEmail(profile.email)) {
            setLoading(true);
            fetch(`${process.env.REACT_APP_SERVER_URL}/user/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify({
                    'email': profile.email,
                    'name': profile.name
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res['status'] === 'success') {
                        showToast({
                            title: 'Success',
                            text: 'Profile Updated Successfully',
                            type: 'success'
                        });
                        setUpdated(false);
                    } else
                        showToast({
                            title: 'Failed',
                            text: 'Profile update failed with as error!',
                            type: 'fail'
                        });
                }).finally(() => {
                setLoading(false);
            });
        }
        return true;
    }

    useEffect(() => {
        if (profile.uid === undefined) {
            setLoading(true);
            fetch(`${process.env.REACT_APP_SERVER_URL}/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
                }
            })
                .then((res) => res.json())
                .then(setProfile)
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [setLoading, profile.uid]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
            <form onSubmit={handleProfileForm}
                  className="rounded-md border-t-4 border-indigo-500 bg-white shadow-md py-6 px-8">
                <div className="flex flex-col pb-6">
                    <label htmlFor="profile-name" className="font-semibold text-gray-700 block pb-1">Name</label>
                    <div className="flex relative ">
                            <span
                                className="rounded-l-md inline-flex  items-center px-3
                                border-t bg-white border-l border-b  border-gray-300
                                text-gray-500 shadow-sm text-sm">
                               <UserIcon className={'w-4 text-gray-500'}/>
                            </span>
                        <input type="text"
                               id="profile-name"
                               value={profile.name}
                               required
                               onChange={handleNameChange}
                               className={
                                   classNames(
                                       profile.err_name !== undefined ? 'ring-1 ring-red-700' : '',
                                       'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                       'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                       'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                       'focus:border-transparent')
                               }
                               placeholder="Your Name"/>
                    </div>
                    {profile.err_name &&
                    <div className={'self-end'}>
                        <p className={'text-red-600'}>{profile.err_name}</p>
                    </div>
                    }
                </div>
                <div className="pb-4 flex flex-col">
                    <label htmlFor="profile-email" className="font-semibold text-gray-700 block pb-1">Email</label>
                    <div className="flex relative ">
                            <span
                                className="rounded-l-md inline-flex  items-center px-3
                                border-t bg-white border-l border-b  border-gray-300
                                text-gray-500 shadow-sm text-sm">
                               <AtSymbolIcon className={'w-4 text-gray-500'}/>
                            </span>
                        <input type="email"
                               id="profile-email"
                               value={profile.email}
                               required
                               onChange={handleEmailChange}
                               className={
                                   classNames(
                                       profile.err_email ? 'ring-1 ring-red-700' : '',
                                       'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                       'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                       'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                       'focus:border-transparent')
                               }
                               placeholder="Your Email"/>
                    </div>
                    {profile.err_email &&
                    <div className={'self-end'}>
                        <p className={'text-red-600'}>{profile.err_email}</p>
                    </div>
                    }
                </div>
                <div className='flex items-center justify-items-end mt-4'>
                    <button
                        disabled={!isUpdated}
                        type="submit"
                        className={`flex items-center justify-center py-2 px-4 
                         ${isUpdated ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200' : 'bg-gray-400'} 
                        text-white w-full transition ease-in duration-200 text-center text-base font-semibold 
                        shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg`}>
                        Update
                        <PencilIcon className='w-4 ml-2'/>
                    </button>
                </div>
            </form>
        </div>
    );
}