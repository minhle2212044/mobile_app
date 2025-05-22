import { IsInt, IsString, MinLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class RewardDto {
    @ApiProperty({
        description: 'Name of the reward',
        example: '',
    })
    @IsString()
    @MinLength(3)
    name: string;
    
    @ApiProperty({
        description: 'Description of the reward',
        example: '',
    })
    @IsString()
    @MinLength(10)
    description: string;
    
    @ApiProperty({
        description: 'Points required to redeem the reward',
        example: 100,
    })
    @IsInt()
    @Min(1)
    pointsRequired: number;
    
    @ApiPropertyOptional({
        description: 'Image URL for the reward',
        example: 'https://example.com/reward.jpg',
    })
    imageUrl?: string;
}

export class UpdateRewardDto {
    @ApiPropertyOptional({
        description: 'Name of the reward',
        example: '',
    })
    @IsString()
    @MinLength(3)
    name?: string;
    
    @ApiPropertyOptional({
        description: 'Description of the reward',
        example: '',
    })
    @IsString()
    @MinLength(10)
    description?: string;
    
    @ApiPropertyOptional({
        description: 'Points required to redeem the reward',
        example: 100,
    })
    @IsInt()
    @Min(1)
    pointsRequired?: number;
    
    @ApiPropertyOptional({
        description: 'Image URL for the reward',
        example: 'https://example.com/reward.jpg',
    })
    imageUrl?: string;
}