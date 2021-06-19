import {Fragment, useContext, useState} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {useLocation, Link} from 'react-router-dom';
import logo from '../icon.svg';

import {
    PhotographIcon,
    UserGroupIcon,
    UserIcon,
    XIcon,
    LogoutIcon,
    MenuIcon
} from '@heroicons/react/outline'

import AuthContext from "../Context/AuthContext";

const navigation = [
    {
        name: 'My Photos',
        href: '/photos',
        icon: PhotographIcon
    },
    {
        name: 'Shared',
        href: '/shared',
        icon: UserGroupIcon
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: UserIcon
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function getSelectedNavigation(location) {
    const matchedNavigations = navigation.filter((nav) => location.pathname.startsWith(nav.href));
    let result = {href: ""};
    for (let matched of matchedNavigations)
        if (matched.href.length > result.href.length)
            result = matched;
    return result;
}

export default function DashboardLayout({children}) {

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const {changeAuthState} = useContext(AuthContext);

    const location = useLocation();
    let selectedNavigation = getSelectedNavigation(location);

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Narrow sidebar */}
            <div className="hidden w-28 bg-indigo-700 overflow-y-auto md:block">
                <div className="w-full h-full py-4 flex flex-col items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <img
                            className="h-14 w-auto"
                            src={logo}
                            alt="Workflow"
                        />
                    </div>
                    <div className="flex-1 mt-6 w-full px-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={classNames(
                                    item === selectedNavigation ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                                    'group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium'
                                )}
                                aria-current={item.current ? 'page' : undefined}
                            >
                                <item.icon
                                    className={classNames(
                                        item === selectedNavigation ? 'text-white' : 'text-indigo-300 group-hover:text-white',
                                        'h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="mt-2">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                    {/*Logout Button*/}
                    <div className="self-end mt-6 w-full px-2 space-y-1">
                        <div
                            onClick={() => {
                                sessionStorage.removeItem('jwtToken');
                                changeAuthState(false);
                            }}
                            className={'group w-full p-3 rounded-md flex flex-col items-center ' +
                            'text-xs font-medium text-indigo-100 hover:bg-indigo-800 ' +
                            'hover:text-white cursor-pointer'}>
                            <LogoutIcon className={'text-indigo-300 group-hover:text-white h-6 w-6'}
                                        aria-hidden="true"/>
                            <span className="mt-2">Log Out</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <Transition.Root show={mobileMenuOpen} as={Fragment}>
                <Dialog
                    as="div"
                    static
                    className="fixed inset-0 z-40 flex md:hidden"
                    open={mobileMenuOpen}
                    onClose={setMobileMenuOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75"/>
                    </Transition.Child>
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="relative max-w-xs w-full bg-indigo-700 pt-5 pb-4 flex-1 flex flex-col">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute top-1 right-0 -mr-14 p-1">
                                    <button
                                        type="button"
                                        className="h-12 w-12 rounded-full flex items-center justify-center focus:outline-none"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <XIcon className="h-6 w-6 text-white" aria-hidden="true"/>
                                        <span className="sr-only">Close sidebar</span>
                                    </button>
                                </div>
                            </Transition.Child>
                            <div className="flex-shrink-0 px-4 flex items-center">
                                <img
                                    className="h-14 w-auto"
                                    src={logo}
                                    alt="Workflow"
                                />

                                <span className={'text-xl font-bold text-white ml-4'}>Image Gallery</span>
                            </div>
                            <div className="mt-5 flex-1 h-0 px-2 overflow-y-auto">
                                <nav className="flex flex-col">
                                    <div className="space-y-1">
                                        {navigation.map((item) => (
                                            <Link
                                                onClick={() => setMobileMenuOpen(false)}
                                                key={item.name}
                                                to={item.href}
                                                className={classNames(
                                                    item === selectedNavigation
                                                        ? 'bg-indigo-800 text-white'
                                                        : 'text-indigo-100 hover:bg-indigo-800 hover:text-white',
                                                    'group py-2 px-3 rounded-md flex items-center text-sm font-medium'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        item === selectedNavigation ? 'text-white' : 'text-indigo-300 group-hover:text-white',
                                                        'mr-3 h-6 w-6'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </nav>
                                {/*Logout Button*/}
                                <div className="self-end mt-6 w-full px-2 space-y-1">
                                    <div
                                        onClick={() => {
                                            sessionStorage.removeItem('jwtToken');
                                            changeAuthState(false);
                                        }}
                                        className={'group py-2 px-3 rounded-md flex items-center text-sm font-medium ' +
                                        'text-xs font-medium text-indigo-100 hover:bg-indigo-800 ' +
                                        'hover:text-white cursor-pointer'}>
                                        <LogoutIcon className={'text-indigo-300 group-hover:text-white mr-3 h-6 w-6'}
                                                    aria-hidden="true"/>
                                        <span>Log Out</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                    <div className="flex-shrink-0 w-14" aria-hidden="true">
                        {/* Dummy element to force sidebar to shrink to fit close icon */}
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="w-full">
                    <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex">
                        <button
                            type="button"
                            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none
                             text-indigo-500 focus:bg-indigo-500 focus:text-white md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true"/>
                        </button>
                        <div className="flex-1 flex justify-between px-4 sm:px-6">
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className={'text-xl font-bold text-indigo-800'}>{selectedNavigation.name}</h1>
                                {location.pathname !== '/' && location.pathname !== selectedNavigation.href &&
                                <p className={'text-sm -mt-1 text-indigo-300'}>{location.pathname}</p>}
                            </div>
                        </div>
                    </div>
                </header>
                <div className={`bg-indigo-50 w-full h-full overflow-y-auto`}>
                    {children}
                </div>
            </div>
        </div>
    )
}

