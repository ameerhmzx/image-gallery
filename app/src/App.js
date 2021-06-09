import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import GalleryLayout from './Layouts/GalleryLayout';
import Auth from './Pages/Auth';
import AuthContext from "./Context/AuthContext";
import {useState} from "react";
import LoadingBar from "./Components/LoadingBar";
import LoadingContext from "./Context/LoadingContext";
import Toast from "./Components/Toast";
import ToastContext from "./Context/ToastContext";

function checkAuth() {
    let token = sessionStorage.getItem('jwtToken');
    return (token != null && token !== '');
}

export default function App() {

    const [authState, changeAuthState] = useState(checkAuth());
    const [isLoading, setLoading] = useState(false);
    const [toastState, showToast] = useState({
        show: false
    });

    return (
        <ToastContext.Provider value={{toastState, showToast}}>
            <LoadingContext.Provider value={{isLoading, setLoading}}>
                <AuthContext.Provider value={{authState, changeAuthState}}>
                    {isLoading && <LoadingBar/>}
                    <Toast/>
                    <Router>
                        <Switch>
                            <Route path="/login">
                                {authState && <Redirect to='/photos'/>}
                                <Auth/>
                            </Route>
                            <Route path="/register">
                                {authState && <Redirect to='/photos'/>}
                                <Auth/>
                            </Route>
                            {authState &&
                            <GalleryLayout>
                                <Route path="/profile">Profile</Route>
                                <Route path="/shared">Shared</Route>
                                <Route path="/photos">Photos</Route>
                            </GalleryLayout>
                            }
                            <Route path="*">
                                {authState ? <Redirect to='/photos'/> : <Redirect to='/login'/>}
                            </Route>
                        </Switch>
                    </Router>
                </AuthContext.Provider>
            </LoadingContext.Provider>
        </ToastContext.Provider>
    );
}