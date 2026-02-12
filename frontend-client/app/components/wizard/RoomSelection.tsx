"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Building, Home, Star } from "lucide-react";
import { cn } from "../ui/Button";

interface RoomType {
    id: string;
    title: string;
    description: string;
    price: string;
    icon: React.ElementType;
}

const ROOM_TYPES: RoomType[] = [
    {
        id: "studio",
        title: "Studio Suite",
        description: "Compact luxury for the modern professional.",
        price: "฿12,000 / mo",
        icon: Home,
    },
    {
        id: "1bed",
        title: "1 Bedroom Executive",
        description: "Spacious living area with premium amenities.",
        price: "฿18,000 / mo",
        icon: Building,
    },
    {
        id: "2bed",
        title: "2 Bedroom Penthouse",
        description: "Ultimate comfort with panoramic city views.",
        price: "฿35,000 / mo",
        icon: Star,
    },
];

interface RoomSelectionProps {
    selectedRoom: string | null;
    onSelect: (roomId: string) => void;
}

export function RoomSelection({ selectedRoom, onSelect }: RoomSelectionProps) {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {ROOM_TYPES.map((room, index) => {
                const isSelected = selectedRoom === room.id;

                return (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(room.id)}
                        className="cursor-pointer group"
                    >
                        <Card className={cn(
                            "h-full transition-all duration-300 relative overflow-hidden",
                            isSelected
                                ? "border-amber-400 bg-slate-900/80 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/50"
                                : "hover:border-amber-500/50 hover:bg-slate-800/50 hover:shadow-xl hover:-translate-y-1"
                        )}>
                            {isSelected && (
                                <div className="absolute top-0 right-0 p-2 bg-gradient-to-bl from-amber-400 to-transparent text-white">
                                    <div className="w-2 h-2 rounded-full bg-white ml-auto mb-auto" />
                                </div>
                            )}

                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    isSelected ? "bg-gold-gradient text-white shadow-lg shadow-amber-500/30" : "bg-slate-800 text-slate-400 group-hover:bg-amber-900/30 group-hover:text-amber-400"
                                )}>
                                    <room.icon size={32} />
                                </div>

                                <div>
                                    <h3 className={cn("text-xl font-serif font-bold mb-2", isSelected ? "text-white" : "text-slate-200")}>
                                        {room.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-4 h-10">
                                        {room.description}
                                    </p>
                                    <div className={cn(
                                        "inline-block px-4 py-1 rounded-full text-sm font-medium",
                                        isSelected ? "bg-amber-500 text-navy-900 font-bold" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {room.price}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
