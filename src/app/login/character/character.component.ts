import {
  Component,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  NgZone,
  input,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';

export type CharacterState =
  | 'idle'
  | 'email-focus'
  | 'password-focus'
  | 'loading'
  | 'success'
  | 'error';

const VIDEO_MAP: Record<CharacterState, string> = {
  'idle':           '/asset/6ab37da841036109Eu5VqXgiq1898.mp4',
  'email-focus':    '/asset/6ab37e72341209281Wir7fceQw4809.mp4',
  'password-focus': '/asset/6ab3c76e141269258FwJBTJcou3974.mp4',
  'loading':        '/asset/6ab37f18630504412zpD3AHiMr6812.mp4',
  'success':        '/asset/6ab37cdb7730798593RTgGZWLG5017.mp4',
  'error':          '/asset/ErrorVideo.mp4',
};

// States whose videos must be ready the INSTANT Sign In is clicked.
// We fetch these as Blobs so the data lives in RAM — zero network/disk latency,
// zero decoder init delay when incoming.src is set.
const BLOB_PRELOAD_STATES: CharacterState[] = ['loading', 'success'];

@Component({
  selector: 'app-character',
  standalone: true,
  templateUrl: './character.component.html',
  styleUrl: './character.component.css',
})
export class CharacterComponent implements OnChanges, AfterViewInit, OnDestroy {
  // ── Signal-based input ────────────────────────────────────────
  readonly state = input<CharacterState>('idle');

  // ── Signal-based view queries ────────────────────────────────
  readonly videoARef = viewChild.required<ElementRef<HTMLVideoElement>>('videoA');
  readonly videoBRef = viewChild.required<ElementRef<HTMLVideoElement>>('videoB');

  // ── Template signals ─────────────────────────────────────────
  readonly showA      = signal(true);
  readonly idleSrc    = VIDEO_MAP['idle'];
  readonly loadingSrc = VIDEO_MAP['loading'];
  readonly successSrc = VIDEO_MAP['success'];

  // ── Internal state ───────────────────────────────────────────
  private currentSrc  = VIDEO_MAP['idle'];
  private rafId: number | null = null;
  private initialized = false;
  private preloadTimer: ReturnType<typeof setTimeout> | null = null;

  // Blob URLs for instant-transition states (loading, success).
  // Key: original asset path → Value: blob: URL (served from RAM)
  private readonly blobCache = new Map<string, string>();

  // Off-screen video elements kept alive for metadata-only preloads
  private preloadVideos: HTMLVideoElement[] = [];

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initialized = true;

    const videoA = this.videoARef().nativeElement;
    videoA.muted        = true;
    videoA.defaultMuted = true;
    videoA.playsInline  = true;

    this.zone.runOutsideAngular(() => {
      // Start idle playback
      const playPromise = videoA.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const resume = () => {
            videoA.play().catch(() => {});
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
          };
          window.addEventListener('pointerdown', resume, { once: true, passive: true });
          window.addEventListener('keydown', resume, { once: true, passive: true });
        });
      }

      // ── Phase 1 (immediate): Fetch loading + success into RAM as Blob URLs.
      //    This is the only reliable way to guarantee zero-latency transitions
      //    on Sign In click. When `incoming.src = blobUrl`, the browser reads
      //    directly from memory — no network, no disk, no decoder init delay.
      BLOB_PRELOAD_STATES.forEach(s => {
        const assetPath = VIDEO_MAP[s];
        fetch(assetPath, { priority: 'low' } as RequestInit)
          .then(res => res.blob())
          .then(blob => {
            // Revoke any stale blob to avoid memory leaks
            const old = this.blobCache.get(assetPath);
            if (old) URL.revokeObjectURL(old);
            this.blobCache.set(assetPath, URL.createObjectURL(blob));
          })
          .catch(() => {
            // Fetch failed — fall back to direct asset path (normal behaviour)
          });
      });

      // ── Phase 2 (2.5 s): Metadata-only preload for focus/error states.
      //    These are user-interaction triggered (focus), so light prefetch is fine.
      this.preloadTimer = setTimeout(() => {
        (['email-focus', 'password-focus', 'error'] as CharacterState[]).forEach(s => {
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.src = VIDEO_MAP[s];
          this.preloadVideos.push(v);
        });
      }, 2500);
    });

    if (this.state() !== 'idle') {
      this.doTransition(VIDEO_MAP[this.state()]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['state']) return;
    if (!this.initialized) return;

    const newSrc = VIDEO_MAP[this.state()];
    if (!newSrc || newSrc === this.currentSrc) return;

    this.doTransition(newSrc);
  }

  private doTransition(assetSrc: string): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    // Use Blob URL if available (in-RAM) — falls back to original path
    const effectiveSrc = this.blobCache.get(assetSrc) ?? assetSrc;

    const isShowingA = this.showA();
    const outgoing   = isShowingA ? this.videoARef().nativeElement : this.videoBRef().nativeElement;
    const incoming   = isShowingA ? this.videoBRef().nativeElement : this.videoARef().nativeElement;

    incoming.muted        = true;
    incoming.defaultMuted = true;
    incoming.playsInline  = true;
    incoming.src          = effectiveSrc;
    this.currentSrc       = assetSrc;   // always store original path for dedup check

    this.zone.runOutsideAngular(() => {
      const onCanPlay = () => {
        incoming.removeEventListener('canplay', onCanPlay);
        incoming.play().catch(() => {});
        this.showA.set(!isShowingA);

        this.rafId = requestAnimationFrame(() => {
          setTimeout(() => {
            if (outgoing && !outgoing.paused) outgoing.pause();
          }, 350);
        });
      };

      if (incoming.readyState >= 2) {
        onCanPlay();
      } else {
        incoming.addEventListener('canplay', onCanPlay, { once: true });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.preloadTimer !== null) clearTimeout(this.preloadTimer);

    // Revoke all Blob URLs to free RAM
    this.blobCache.forEach(url => URL.revokeObjectURL(url));
    this.blobCache.clear();

    this.preloadVideos.forEach(v => { v.src = ''; });
    this.preloadVideos = [];
  }
}
