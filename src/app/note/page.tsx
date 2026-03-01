import NoteMockData from '@/entities/note/api/mockData';
import Note from '@/entities/note/Note';

export default function Page() {
  return (
    <div className="flex items-center justify-center">
      <Note {...NoteMockData[0]} />
    </div>
  );
}
