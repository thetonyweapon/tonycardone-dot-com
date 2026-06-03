import Nav from './Nav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Nav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;