import { Dependency } from '../model';
import { motion } from 'framer-motion';

export default function DependencyCard({ dependency }: { dependency: Dependency }) {
    return (
        <div className="bg-[#EAEDF2] rounded-2xl p-4 shadow flex flex-row items-center justify-between mr-4"
            style={{
                boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
            }}
        >
            <div className="flex-1">
                <div className="text-base font-semibold mb-1 text-gray-900">{dependency.title}</div>
                <div className="text-sm text-gray-700 font-normal mb-4">{dependency.description}</div>
                <div className="w-[255px] h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gray-800 rounded-full"
                        style={{ width: 0 }}
                        animate={{ width: `${Math.round(dependency.progress * 100)}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>
            <div className="flex flex-col items-end gap-4 min-w-[180px] mt-4 md:mt-0">
                <div className="text-sm text-gray-400 font-normal mb-2">{dependency.status}</div>
                <button className="text-sm bg-[#EAEDF2] rounded-xl px-16 py-2 text-gray-700 font-semibold"
                    style={{
                        boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                    }}
                >Action</button>
            </div>
        </div>
    );
} 