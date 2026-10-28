import { useMemo } from "react";
import { Avatar as DiceBearAvatar, Style } from "@dicebear/core";
import lorelei from "@dicebear/styles/lorelei.json";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
    seed: string;
    profilePictureUrl: string | null;
    alt?: string;
    size?: number;
    className?: string;
};

const avatarStyle = new Style(lorelei);

export default function UserAvatar({
    seed,
    profilePictureUrl,
    alt = "Avatar do usuário",
    size = 40,
    className,
}: UserAvatarProps) {
    const generatedAvatar = useMemo(() => {
        return new DiceBearAvatar(avatarStyle, {
            seed: seed || "partyup-default",
            size,
        }).toDataUri();
    }, [seed, size]);

    return (
        <Avatar
            className={cn("shrink-0", className)}
            style={{ width: size, height: size }}
        >
            <AvatarImage
                src={profilePictureUrl || generatedAvatar}
                alt={alt}
            />

            <AvatarFallback>
                {seed.slice(0, 2).toUpperCase() || "PU"}
            </AvatarFallback>
        </Avatar>
    );
}