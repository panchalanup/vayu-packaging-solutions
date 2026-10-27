import { Outlet, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

/** Admin create / edit / view forms shown over the list page. Lazy-loaded: public visitors never download it. */
const AdminEntityOverlay = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const closeOverlay = () => {
    navigate(-1);
  };

  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => !open && closeOverlay()}>
        <DrawerContent className="max-h-[94dvh] overflow-y-auto">
          <div className="p-3 pb-6">
            <Outlet />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && closeOverlay()}>
      <DialogContent className="h-[94vh] max-h-[94vh] max-w-6xl overflow-y-auto p-0">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEntityOverlay;
