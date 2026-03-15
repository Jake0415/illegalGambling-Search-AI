'use client'

import {
  ArrowRight,
  Brain,
  Building2,
  Camera,
  FileText,
  Landmark,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Search,
    title: '자동 탐지',
    description:
      'Google Custom Search + Scrapy 기반 자동 검색으로 불법 도박 사이트를 지속적으로 탐지합니다.',
  },
  {
    icon: Camera,
    title: '3단계 채증',
    description:
      '메인화면, 회원가입, 배팅 화면까지 자동 스크린샷 및 HTML/WARC 채증을 수행합니다.',
  },
  {
    icon: Brain,
    title: 'AI 분류',
    description:
      'Claude Haiku 기반 자동 분류로 F1 94% 이상의 정확도를 제공합니다.',
  },
  {
    icon: ShieldCheck,
    title: '증거 무결성',
    description:
      'SHA-256 해시 + OpenTimestamps + RFC 3161 타임스탬프로 법적 증거 무결성을 보장합니다.',
  },
  {
    icon: Phone,
    title: 'SMS 자동 인증',
    description:
      'Non-VoIP 가상번호 기반 회원가입 자동화로 심층 채증이 가능합니다.',
  },
  {
    icon: FileText,
    title: '법원 제출 보고서',
    description:
      '기관별 양식에 맞는 증거 패키지 및 보고서를 자동으로 생성합니다.',
  },
]

const PIPELINE_STEPS = [
  {
    label: '탐지',
    sub: 'Google Search + Scrapy',
  },
  {
    label: '접속',
    sub: 'Playwright + 프록시 + Anti-bot',
  },
  {
    label: '채증',
    sub: '3단계 스크린샷 HTML/WARC',
  },
  {
    label: '증거 패키지',
    sub: 'SHA-256 + OpenTimestamps + RFC 3161',
  },
]

const ORGANIZATIONS = [
  {
    icon: Building2,
    name: '사행산업통합감독위원회',
    description: '사행산업 규제 전반 관리',
  },
  {
    icon: Shield,
    name: '경찰청 사이버수사국',
    description: '불법 도박 수사 증거 확보',
  },
  {
    icon: Landmark,
    name: '한국마사회',
    description: '불법 경마 사이트 모니터링',
  },
  {
    icon: Trophy,
    name: '국민체육진흥공단',
    description: '불법 체육 도박 감시',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LandingView() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              GG
            </div>
            <span className="text-lg font-bold">GambleGuard</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              기능 소개
            </a>
            <a
              href="#organizations"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              대상 기관
            </a>
            <Button asChild size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Button asChild size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              불법 도박 사이트를
              <br />
              <span className="text-primary">자동으로 탐지</span>하고,
              <br />
              법적 증거를 확보합니다.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              AI 기반 불법 도박 사이트 자동 검색, 3단계 채증,
              <br className="hidden sm:inline" />
              블록체인 타임스탬프 증거 무결성 보장
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">
                  로그인
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:admin@gambling-watch.kr">데모 요청</a>
              </Button>
            </div>
          </div>

          {/* Dashboard mockup placeholder */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-xl border-2 bg-gradient-to-br from-muted/50 to-muted p-8 text-center shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-yellow-400" />
                <div className="size-3 rounded-full bg-green-400" />
                <div className="ml-2 h-6 flex-1 rounded bg-muted-foreground/10" />
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {['사이트 1,247건', '진행 중 23건', '성공률 94%', '대기 큐 3건'].map(
                  (text) => (
                    <div
                      key={text}
                      className="rounded-lg border bg-background p-3 text-xs font-medium"
                    >
                      {text}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 h-32 rounded-lg border bg-background" />
                <div className="h-32 rounded-lg border bg-background" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              우리 시스템의 핵심 기능
            </h2>
            <p className="mt-2 text-muted-foreground">
              불법 도박 사이트 단속에 필요한 모든 기능을 제공합니다
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Section */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              시스템 파이프라인
            </h2>
            <p className="mt-2 text-muted-foreground">
              자동화된 4단계 파이프라인으로 증거를 수집합니다
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-0">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center rounded-xl border bg-background px-6 py-4 text-center shadow-sm min-w-[180px]">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mb-2">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-sm">{step.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.sub}
                  </p>
                </div>
                {index < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="mx-3 size-5 text-muted-foreground shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section id="organizations" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              서비스 대상 기관
            </h2>
            <p className="mt-2 text-muted-foreground">
              인가된 수사 기관 및 감독 기관을 위한 시스템입니다
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ORGANIZATIONS.map((org) => (
              <Card
                key={org.name}
                className="text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardContent className="pt-6">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <org.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{org.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {org.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            지금 시작하세요
          </h2>
          <p className="mt-2 text-muted-foreground">
            불법 도박 사이트 단속의 새로운 기준
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                로그인
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:admin@gambling-watch.kr">데모 요청</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  GG
                </div>
                <span className="font-bold">GambleGuard</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                불법 도박 사이트 자동 채증 시스템
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">연락처</h4>
              <p className="text-sm text-muted-foreground">
                admin@gambling-watch.kr
              </p>
            </div>

            <div className="space-y-1">
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground">
                개인정보처리방침
              </Button>
              <br />
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground">
                이용약관
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <p>
              본 시스템은 인가된 수사 기관 및 감독 기관만 사용할 수 있습니다.
            </p>
            <p>&copy; 2026 GambleGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
