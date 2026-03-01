import { Refine } from "@refinedev/core";

import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { accessControlProvider } from "./providers/access-control";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { AuthenticatedLayout } from "./components/auth/authenticated";
import { BookOpen, Building2, GraduationCap, Home, School, Users, ClipboardList } from "lucide-react";
import { Layout } from "./components/refine-ui/layout/layout";
import SubjectsList from "./pages/subjects/lists";
import SubjectsCreate from "./pages/subjects/create";
import SubjectsEdit from "./pages/subjects/edit";
import SubjectsShow from "./pages/subjects/show";
import ClassesList from "./pages/classes/lists";
import ClassesCreate from "./pages/classes/create";
import ClassesEdit from "./pages/classes/edit";
import ClassesShow from "./pages/classes/show";
import DepartmentsList from "./pages/departments/lists";
import DepartmentsCreate from "./pages/departments/create";
import DepartmentsEdit from "./pages/departments/edit";
import DepartmentsShow from "./pages/departments/show";
import UsersList from "./pages/users/lists";
import UsersCreate from "./pages/users/create";
import UsersEdit from "./pages/users/edit";
import UsersShow from "./pages/users/show";
import JoinRequestsList from "./pages/join-requests/list";
import Profile from "./pages/profile";


function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "VDwJFc-uxKxKn-hMR71w",
                title: {
                  text: "Zeusda's School",
                  icon: <School className="h-8 w-8 text-primary" />,
                },
              }}
              resources={[
                { name: 'dashboard', list: '/', meta: { label: 'Home', icon: <Home /> } },
                { name: 'departments', list: '/departments', create: '/departments/create', edit: '/departments/edit/:id', show: '/departments/show/:id', meta: { label: 'Departments', icon: <Building2 /> } },
                { name: 'subjects', list: '/subjects', create: '/subjects/create', edit: '/subjects/edit/:id', show: '/subjects/show/:id', meta: { label: 'Subjects', icon: <BookOpen /> } },
                { name: 'classes', list: '/classes', create: '/classes/create', edit: '/classes/edit/:id', show: '/classes/show/:id', meta: { label: 'Classes', icon: <GraduationCap /> } },
                { name: 'join-requests', list: '/join-requests', meta: { label: 'Pending Requests', icon: <ClipboardList /> } },
                { name: 'users', list: '/users', create: '/users/create', edit: '/users/edit/:id', show: '/users/show/:id', meta: { label: 'Users', icon: <Users /> } },
              ]}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<AuthenticatedLayout />}>
                  <Route element={<Layout><Outlet /></Layout>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="edit/:id" element={<DepartmentsEdit />} />
                    <Route path="show/:id" element={<DepartmentsShow />} />
                  </Route>
                  <Route path="subjects">
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                    <Route path="edit/:id" element={<SubjectsEdit />} />
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>
                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="edit/:id" element={<ClassesEdit />} />
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path="create" element={<UsersCreate />} />
                    <Route path="edit/:id" element={<UsersEdit />} />
                    <Route path="show/:id" element={<UsersShow />} />
                  </Route>
                  <Route path="join-requests" element={<JoinRequestsList />} />
                  <Route path="profile" element={<Profile />} />

                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler
                handler={({ autoGeneratedTitle }) => {
                  const parts = autoGeneratedTitle.split('|').map(s => s.trim());
                  // Replace default "Refine" suffix with our app name
                  if (parts.length > 1) {
                    return `${parts[0]} | Zeusda's School`;
                  }
                  return "Zeusda's School";
                }}
              />
            </Refine>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
