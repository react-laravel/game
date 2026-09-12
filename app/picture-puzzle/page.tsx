'use client'

import React, { useState, Suspense } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { GameHud, GameResultOverlay, GameStage } from '@/components/game'
import { imageAsset } from '@/lib/helpers/assets'
import { cn } from '@/lib/helpers'

const PicturePuzzle = dynamic(() => import('./components/PicturePuzzle'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">加载游戏中...</div>,
})

const GAME_RULES = [
  '将打乱的图片方块移动到正确位置',
  '点击与空白方块相邻的方块可以移动它',
  '重新组合完整图片即可获胜',
  '支持键盘方向键控制',
  '可以选择3×3、4×4、5×5三种难度',
  '支持上传自定义图片进行拼图',
]

const SYSTEM_IMAGES = [
  {
    id: 'bg1',
    name: '风景1',
    url: imageAsset('/images/backgrounds/F_RIhiObMAA-c8N.jpeg'),
    thumbnail: imageAsset('/images/backgrounds/F_RIhiObMAA-c8N.jpeg'),
  },
  {
    id: 'bg3',
    name: '风景2',
    url: imageAsset('/images/backgrounds/wallhaven-72rd8e_2560x1440-1.webp'),
    thumbnail: imageAsset('/images/backgrounds/wallhaven-72rd8e_2560x1440-1.webp'),
  },
  {
    id: 'project1',
    name: '游戏界面',
    url: imageAsset('/images/projects/game.png'),
    thumbnail: imageAsset('/images/projects/game.png'),
  },
  {
    id: 'project2',
    name: '实验室',
    url: imageAsset('/images/projects/lab.png'),
    thumbnail: imageAsset('/images/projects/lab.png'),
  },
  {
    id: 'project3',
    name: '笔记应用',
    url: imageAsset('/images/projects/note.png'),
    thumbnail: imageAsset('/images/projects/note.png'),
  },
]

const DEFAULT_IMAGE = SYSTEM_IMAGES[0]

function PicturePuzzleGame() {
  const [selectedImage, setSelectedImage] = useState<string>(DEFAULT_IMAGE.url)
  const [difficulty, setDifficulty] = useState<3 | 4 | 5>(3)
  const [gameKey, setGameKey] = useState(0)
  const [completionMessage, setCompletionMessage] = useState('')

  const startGame = (imageUrl?: string, level?: 3 | 4 | 5) => {
    if (imageUrl) setSelectedImage(imageUrl)
    if (level) setDifficulty(level)
    setCompletionMessage('')
    setGameKey(prev => prev + 1)
  }

  const playAgain = () => {
    setCompletionMessage('')
    setGameKey(prev => prev + 1)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => {
        const imageUrl = e.target?.result as string
        startGame(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGameComplete = () => {
    setCompletionMessage(`恭喜！你完成了 ${difficulty}×${difficulty} 的图片拼图！`)
  }

  return (
    <GameStage title="图片拼图" rules={GAME_RULES} contentClassName="items-center">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <GameHud>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={difficulty === 3 ? 'default' : 'outline'}
              size="sm"
              onClick={() => startGame(undefined, 3)}
            >
              3×3
            </Button>
            <Button
              variant={difficulty === 4 ? 'default' : 'outline'}
              size="sm"
              onClick={() => startGame(undefined, 4)}
            >
              4×4
            </Button>
            <Button
              variant={difficulty === 5 ? 'default' : 'outline'}
              size="sm"
              onClick={() => startGame(undefined, 5)}
            >
              5×5
            </Button>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                上传图片
              </Button>
            </div>
          </div>
        </GameHud>

        <GameHud>
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4" />
              系统图片
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {SYSTEM_IMAGES.map(image => {
                const isActive = selectedImage === image.url
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => startGame(image.url)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl border px-2 py-2 transition-colors',
                      isActive
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-border/60 hover:border-primary'
                    )}
                  >
                    <Image
                      src={image.thumbnail}
                      alt={image.name}
                      width={72}
                      height={72}
                      className="rounded-xl object-cover"
                    />
                    <span className="text-muted-foreground text-xs">{image.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </GameHud>

        {selectedImage && (
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
              <div key={`game-${gameKey}`}>
                <PicturePuzzle
                  imageUrl={selectedImage}
                  size={difficulty}
                  onComplete={handleGameComplete}
                />
              </div>
            </div>

            <GameResultOverlay open={!!completionMessage} eyebrow="完成" title={completionMessage}>
              <Button
                className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
                onClick={playAgain}
              >
                再玩一次
              </Button>
            </GameResultOverlay>
          </div>
        )}
      </div>
    </GameStage>
  )
}

export default function PicturePuzzlePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
      <PicturePuzzleGame />
    </Suspense>
  )
}
