import { useGuidelineStore } from '@/store/guidelinesStore';
import Badge from '@mui/material/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Button from '@/shared/ui/button';
import { useNoteStore } from '@/entities/note/store';
import useWorkspaceStore from '@/store/workSpaceStore';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { useEffect } from 'react';
import { getCookie } from '@/lib/config/api';

export default function NoteButton() {
  const { step } = useGuidelineStore();
  const { setIsCreate, setIsShow, isShow, clearAllNotes, notes, fetchNotes } = useNoteStore();
  const { setFullScreen } = useWorkspaceStore();
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();

  const notesCount = notes.length;

  useEffect(() => {
    // Only fetch notes when product changes, not when vehicle changes
    // Vehicle change is handled by VehicleCanvasWrapper to avoid duplicate calls
    const token = getCookie('access_token');
    if (token && chosenProduct?.id) {
      fetchNotes(chosenProduct.id, selectedVehicleId || undefined);
    }
  }, [fetchNotes, chosenProduct?.id]); // Removed selectedVehicleId to avoid duplicate calls

  return (
    <div
      className={`note-button h-10 w-10 fixed right-3 top-3 ${
        step === 4 ? 'z-110 pointer-events-none' : 'z-50'
      }`}
      onMouseEnter={() => setFullScreen(false)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="hover:scale-95 transition-all cursor-pointer">
            <Badge
              badgeContent={notesCount}
              max={99}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#0055FF',
                  color: 'white',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1.5,
                  marginRight: 1,
                },
              }}
            >
              <Button image="/corner-buttons/note.svg" />
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mr-20 bg-white w-[200px] border-none"
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
          }}
        >
          <DropdownMenuItem
            className="cursor-pointer hover:underline"
            onClick={() => setIsCreate(true)}
          >
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex justify-between cursor-pointer hover:underline"
            onClick={() => {
              if (isShow) {
                setIsShow(false);
              } else {
                setIsShow(true);
                if (chosenProduct?.id) {
                  fetchNotes(chosenProduct.id);
                }
              }
            }}
          >
            {(isShow && <div>Stop Viewing</div>) || <div>View Notes</div>}
            <div className="text-[#9D9D9D]">{notesCount} Notes</div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:underline cursor-pointer"
            onClick={() => clearAllNotes(chosenProduct?.id, selectedVehicleId || undefined)}
          >
            Delete All Notes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
