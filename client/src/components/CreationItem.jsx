import React, { useState } from "react";
import Markdown from 'react-markdown';

const CreationItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div onClick={() => setExpanded(!expanded)} className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2 className="font-medium text-gray-800">{item.prompt}</h2>
                    <p className="text-gray-500 text-xs mt-1">
                        {item.type} • {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                </div>
                <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-3 py-1 text-xs capitalize rounded-full">
                    {item.type}
                </button>
            </div>
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {item.type === "image" ? (
                        <div>
                            <img
                                src={item.content}
                                alt="AI output"
                                className="w-full max-w-md rounded-lg object-cover"
                            />
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto text-sm text-slate-700">
                            <div className="reset-tw">
                                <Markdown>{item.content}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreationItem;
