import React, { useState } from 'react';
import Modal from '@/shared/portals/ModalWindow';

interface Person {
    id: string;
    name: string;
    position: string;
}

interface AddPeopleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPeople: (people: Person[]) => void;
}

const AddPeopleModal: React.FC<AddPeopleModalProps> = ({ isOpen, onClose, onAddPeople }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);

    const people: Person[] = [
        { id: '1', name: 'John Doe', position: 'Engineer' },
        { id: '2', name: 'Jane Smith', position: 'Engineer' },
        { id: '3', name: 'Peter Jones', position: 'Designer' },
        { id: '4', name: 'Alice Brown', position: 'Product Manager' },
        { id: '5', name: 'Bob White', position: 'Engineer' },
        { id: '6', name: 'Charlie Green', position: 'QA Engineer' },
        { id: '7', name: 'Diana Blue', position: 'UX Researcher' },
        { id: '8', name: 'Frank Black', position: 'Scrum Master' },
    ];

    const filteredPeople = people.filter(person =>
        person.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelectPerson = (person: Person) => {
        setSelectedPeople((prevSelected) =>
            prevSelected.some((p) => p.id === person.id)
                ? prevSelected.filter((p) => p.id !== person.id)
                : [...prevSelected, person]
        );
    };

    const handleAddClick = () => {
        onAddPeople(selectedPeople);
        setSelectedPeople([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} noDimming={true}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-[450px] max-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Add people</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search here"
                        className="flex-grow px-4 py-2 border-2 border-transparent rounded-lg focus:outline-none"
                        style={{
                            border: '1px solid',
                            borderImageSource: 'linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%)',
                            borderImageSlice: 1,
                        }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button className="ml-3 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.75 0 5 2.25 5 5v.25c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V8c0-2.75 2.25-5 5-5Zm0 0-2 2-2-2m4 0-2 2-2-2" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        {filteredPeople.map((person) => (
                            <div
                                key={person.id}
                                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${selectedPeople.some((p) => p.id === person.id) ? 'bg-blue-100' : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => handleSelectPerson(person)}
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="font-semibold text-gray-800">{person.name}</p>
                                    <p className="text-sm text-gray-500">{person.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
                        onClick={handleAddClick}
                    >
                        Add
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddPeopleModal; 