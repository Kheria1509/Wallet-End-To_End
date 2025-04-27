import { useNavigate } from "react-router-dom";

export const Appbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/signin');
    };

    return (
      <div className="shadow h-14 flex justify-between">
        <div className="flex flex-col justify-center h-full ml-4">
          PayTM App
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center h-full mr-4">Hello</div>
          <button
            onClick={handleLogout}
            className="flex flex-col justify-center h-full mr-4 text-red-600 hover:text-red-700"
          >
            Logout
          </button>
          <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
            <div className="flex flex-col justify-center h-full text-xl">U</div>
          </div>
        </div>
      </div>
    );
}