import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import LandingPage from './screens/LandingPage.js';
import Test from './screens/test.js';
import Profile from './screens/profile.js';
import ViewProfile from './screens/viewprofile.js';
import ViewHome from './screens/viewhome.js';
import EditProfile from './screens/editprofile.js';
import Project from './screens/project.js';
import AllProjects from './screens/allprojects.js';
import ProjectVersions from './screens/projectversions.js';
import ResetPassword from './screens/resetPassword.js';
import ForgotPassword from './screens/forgotPassword.js';
import Header from './screens/header';
import SignUp from './screens/signup.js';

function App() {
	return (
		<Router>
			<div className='myhtml'>
				<div className='main-header'>
					<Header />
				</div>
				<div className='main-content'>
					<Routes>
						<Route exact path='/' element={<LandingPage></LandingPage>}></Route>
						<Route exact path='/test' element={<Test></Test>}></Route>
						<Route exact path='/profile' element={<Profile></Profile>}></Route>
						<Route exact path='/viewprofile' element={<ViewProfile></ViewProfile>}></Route>
						<Route exact path='/viewhome' element={<ViewHome></ViewHome>}></Route>
						<Route exact path='/editprofile' element={<EditProfile></EditProfile>}></Route>
						<Route exact path='/project' element={<Project></Project>}></Route>
						<Route exact path='/allprojects' element={<AllProjects></AllProjects>}></Route>
						<Route exact path='/projectversions' element={<ProjectVersions></ProjectVersions>}></Route>
						<Route exact path='/crtuser' element={<SignUp></SignUp>}></Route>
						<Route exact path='/resetPassword/:json' element={<ForgotPassword></ForgotPassword>}></Route>
						<Route exact path='/resetPassword' element={<ResetPassword></ResetPassword>}></Route>
					</Routes>
				</div>
				<ToastContainer />
			</div>
		</Router>
	);
}

export default App;
