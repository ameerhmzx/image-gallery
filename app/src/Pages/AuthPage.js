import {Switch, Route, Link, useLocation} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {AtSymbolIcon, LockClosedIcon, LockOpenIcon, UserIcon} from "@heroicons/react/solid";
import {LoginIcon, UserAddIcon} from "@heroicons/react/outline";

import AuthContext from "../Context/AuthContext";
import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import Server from "../utils/Server";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function AuthPage() {

    const {changeAuthState} = useContext(AuthContext);
    const {setLoading} = useContext(LoadingContext);
    const {showToast} = useContext(ToastContext);

    const initialFormState = {
        name: '',
        email: '',
        pass: '',
        con_pass: '',
        err_email: '',
        err_pass: '',
        err_con_pass: '',
        err_name: ''
    };
    const [formState, setFormState] = useState(initialFormState);
    const [form, setForm] = useState(undefined);

    const location = useLocation().pathname;
    useEffect(() => {
        if(form)
            form.reset();
    }, [location, form]);

    function loginHandler(event) {
        event.preventDefault();
        if (validateAllFields(false)) {
            setLoading(true);
            Server.post(`/user/login`, {
                email: formState.email,
                password: formState.pass
            })
                .then((res) => {
                    let response = res.data;
                    if (response['status'] === 'success' && response['token'] !== undefined) {
                        sessionStorage.setItem('jwtToken', response['token']);
                        changeAuthState(true);
                    }
                })
                .catch(err => {
                    let response = err.response.data;
                    if (response['status'] === 'fail' || response['status'] === 'error') {
                        if (response['code'] === 'err-wrong-pass')
                            showToast({title: 'Unable to Login', text: 'Wrong credentials', type: 'fail'});
                        else
                            showToast({
                                title: 'Unable to Login',
                                text: 'Can\'t find the user, try registering first.',
                                type: 'fail'
                            });
                    } else {
                        showToast({title: 'Unable to Login', text: 'Unexpected error occurred!', type: 'fail'});
                    }
                })
                .finally(() => setLoading(false));
            return true;
        }
        return false;
    }

    function registerHandler(event) {
        event.preventDefault();
        if (validateAllFields(true)) {
            setLoading(true);
            Server.post(`/user/register`, {
                name: formState.name,
                email: formState.email,
                password: formState.pass
            })
                .then((res) => {
                    let response = res.data;
                    if (response['status'] === 'success' && response['token'] !== undefined) {
                        sessionStorage.setItem('jwtToken', response['token']);
                        changeAuthState(true);
                    }
                })
                .catch((err) => {
                    let response = err.response.data;
                    if (response['status'] === 'fail' || response['status'] === 'error') {
                        showToast({
                            title: 'Unable to register',
                            text: 'Either user already existed or some unknown error occurred!',
                            type: 'fail'
                        });
                    } else {
                        showToast({title: 'Unable to register', text: 'Unexpected error occurred!', type: 'fail'});
                    }
                })
                .finally(() => setLoading(false));
            return true;
        }
        return false;
    }

    function emailFieldListener(event) {
        let newState = {...formState};
        newState.email = event.target.value;
        if (newState.err_email !== '')
            newState.err_email = /^[^\s@]+@[^\s@]+$/
                .test(newState.email.toLowerCase()) ? '' : 'Enter Valid Email Address!';
        setFormState(newState);
    }

    function passFieldListener(event) {
        let newState = {...formState};
        newState.pass = event.target.value;
        if (newState.err_pass !== '' || newState.err_con_pass !== '') {
            newState.err_pass = (newState.pass.length < 8) && (newState.pass.length > 0) ? 'Password must be at least 8 characters long' : '';
            newState.err_con_pass = (newState.pass === newState.con_pass) ?
                '' : 'Passwords must match';
        }
        setFormState(newState);
    }

    function conPassFieldListener(event) {
        let newState = {...formState};
        newState.con_pass = event.target.value;
        if (newState.err_con_pass !== '')
            newState.err_con_pass = (newState.pass === newState.con_pass) ?
                '' : 'Passwords must match';
        setFormState(newState);
    }

    function nameFieldListener(event) {
        let newState = {...formState};
        newState.name = event.target.value;
        // if (newState.err_name !== '')
        //     newState.err_name = (newState.name.length > 0) ?
        //         '' : 'Name should not be Empty!';
        setFormState(newState);
    }

    function validateAllFields(isRegistering) {
        let newState = {...formState};
        newState.err_name = (newState.name.length > 0) ?
            '' : 'Name should not be Empty!';

        newState.err_con_pass = (newState.pass === newState.con_pass) ?
            '' : 'Passwords must match';

        newState.err_pass = (newState.pass.length < 8) ?
            'Password must be at least 8 characters long' : '';

        newState.err_email = /^[^\s@]+@[^\s@]+$/
            .test(newState.email.toLowerCase()) ? '' : 'Enter Valid Email Address!';

        setFormState(newState);

        return newState.err_email === '' && newState.err_pass === ''
            && (!isRegistering || (newState.err_con_pass === '' && newState.err_name === ''))
            && newState.email !== '' && newState.pass !== ''
            && (!isRegistering || (newState.con_pass !== '' && newState.name !== ''));
    }

    return (
        <Route>
            <Switch>
                <Route path="/register">
                    <div className="flex items-center justify-center w-full h-full min-h-screen bg-indigo-50">
                        <div
                            className="flex flex-col w-full max-w-md px-4 py-8 bg-white rounded-lg
                             shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
                            <div
                                className="self-center mb-6 text-xl font-light
                                text-indigo-700 sm:text-2xl dark:text-white font-bold">
                                Create New Account
                            </div>
                            <div className="mt-8">
                                <form onSubmit={registerHandler} ref={(el) => setForm(el)}>
                                    <div className="flex flex-col mb-2">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3
                                                border-t bg-white border-l border-b  border-gray-300
                                                text-gray-500 shadow-sm text-sm">
                                               <UserIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="text"
                                                   id="register-name"
                                                   name="name"
                                                   required
                                                   onChange={nameFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_name !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                                           'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                                           'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                                           'focus:border-transparent')
                                                   }
                                                   placeholder="Your Name"/>
                                        </div>
                                        {formState.err_name !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_name}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex flex-col mb-2">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3
                                                border-t bg-white border-l border-b  border-gray-300
                                                text-gray-500 shadow-sm text-sm">
                                               <AtSymbolIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="email"
                                                   id="email_tf"
                                                   name="email"
                                                   required
                                                   onChange={emailFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_email !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                                           'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                                           'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                                           'focus:border-transparent')
                                                   }
                                                   placeholder="Your email"/>
                                        </div>
                                        {formState.err_email !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_email}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex flex-col mb-2">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                                                <LockClosedIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="password" id="register-pass"
                                                   name="pass"
                                                   required
                                                   onChange={passFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_pass !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                                           'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                                           'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                                           'focus:border-transparent')
                                                   }
                                                   placeholder="Your password"/>
                                        </div>
                                        {formState.err_pass !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_pass}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex flex-col mb-6">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                                                <LockOpenIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="password" id="register-con-pass"
                                                   name="con_pass"
                                                   required
                                                   onChange={conPassFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_con_pass !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                                           'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                                           'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                                           'focus:border-transparent')
                                                   }
                                                   placeholder="Confirm password"/>
                                        </div>
                                        {formState.err_con_pass !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_con_pass}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex w-full">
                                        <button type="submit"
                                                className="flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg">
                                            Register
                                            <UserAddIcon className={'mx-2 w-5 h-auto'}/>
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="flex items-center justify-center mt-6">
                                <Link to="/login"
                                      className="inline-flex items-center text-xs text-center text-indigo-500 hover:text-indigo-700">
                                    <span className="ml-2">
                                        Already have an account?
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Route>
                <Route path="/login">
                    <div className="flex items-center justify-center w-full h-full min-h-screen bg-indigo-50">
                        <div
                            className="flex flex-col w-full max-w-md px-4 py-8 bg-white rounded-lg
                             shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10">
                            <div
                                className="self-center mb-6 text-xl font-light
                                text-indigo-700 sm:text-2xl dark:text-white font-bold">
                                Login To Your Account
                            </div>
                            <div className="mt-8">
                                <form onSubmit={loginHandler} ref={(el) => setForm(el)}>
                                    <div className="flex flex-col mb-2">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3
                                                border-t bg-white border-l border-b  border-gray-300
                                                text-gray-500 shadow-sm text-sm">
                                               <AtSymbolIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="text" id="sign-in-email"
                                                   name="email"
                                                   required
                                                   onChange={emailFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_email !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full ' +
                                                           'py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm ' +
                                                           'text-base focus:outline-none focus:ring-1  focus:ring-indigo-600 ' +
                                                           'focus:border-transparent')
                                                   }
                                                   placeholder="Your email"/>
                                        </div>
                                        {formState.err_email !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_email}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex flex-col mb-6">
                                        <div className="flex relative ">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                                                <LockClosedIcon className={'w-4 text-gray-500'}/>
                                            </span>
                                            <input type="password" id="sign-in-pass"
                                                   name="pass"
                                                   required
                                                   onChange={passFieldListener}
                                                   className={
                                                       classNames(
                                                           formState.err_pass !== '' ? 'ring-1 ring-red-700' : '',
                                                           'rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent')
                                                   }
                                                   placeholder="Your password"/>
                                        </div>
                                        {formState.err_pass !== '' &&
                                        <div className={'self-end'}>
                                            <p className={'text-red-600'}>{formState.err_pass}</p>
                                        </div>
                                        }
                                    </div>
                                    <div className="flex w-full">
                                        <button type="submit"
                                                className="flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-lg">
                                            Login
                                            <LoginIcon className={'mx-2 w-5 h-auto text-white'}/>
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="flex items-center justify-center mt-6">
                                <Link to="/register"
                                      className="inline-flex items-center text-xs text-center text-indigo-500 hover:text-indigo-700">
                                    <span className="ml-2">
                                        Don&#x27;t have an account?
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Route>
            </Switch>
        </Route>
    );
}
