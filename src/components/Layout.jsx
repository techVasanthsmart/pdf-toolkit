import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopNav from "./TopNav";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans selection:bg-indigo-500/30">
      <TopNav />

      <div className="flex-1 flex flex-col w-full px-4 md:px-6 py-6 min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              transition={{ duration: 0.3, cubicBezier: [0.4, 0, 0.2, 1] }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
