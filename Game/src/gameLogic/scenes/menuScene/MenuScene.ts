import * as Phaser from 'phaser';
import {ASSET_KEYS, SCENE_KEYS} from './DataTypes';

export class TitleScene extends Phaser.Scene {
    private music!: Phaser.Sound.WebAudioSound;
    private musicEnabled: boolean = true;
    private soundEnabled: boolean = true;
    private musicVolume: number = 0.5;
    private soundVolume: number = 0.7;

    private menuItems: Phaser.GameObjects.Text[] = [];
    private selectedItemIndex: number = 0;
    private isInSettingsMenu: boolean = false;

    private settingsContainer!: Phaser.GameObjects.Container;
    private settingsItems: Phaser.GameObjects.Text[] = [];
    private selectedSettingsIndex: number = 0;


    constructor() {
        super({key: SCENE_KEYS.TITLE});
    }

    public create(): void {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
        this.add.text(
            this.scale.width / 2,
            100,
            '🎹 Solitaire 🎹',
            {
                fontFamily: 'Arial',
                fontSize: '54px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0);


        // Initialize audio
        this.initializeAudio();

        // Create main menu
        this.createMainMenu();

        // Create settings menu
        this.createSettingsMenu();

        // Setup controls
        this.setupControls();

        // Version text
        this.add.text(20, this.scale.height - 30, 'v1.0.0', {
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0, 1);
    }

    private initializeAudio(): void {
        this.musicEnabled = this.registry.get('musicEnabled') ?? true;
        this.soundEnabled = this.registry.get('soundEnabled') ?? true;
        this.musicVolume = this.registry.get('musicVolume') ?? 0.5;
        this.soundVolume = this.registry.get('soundVolume') ?? 0.7;

        this.music = this.sound.add('background_music', {
            loop: true,
            volume: 0
        }) as Phaser.Sound.WebAudioSound;


        if (this.musicEnabled) {
            this.music.play();
            this.tweens.add({
                targets: this.music,
                volume: this.musicVolume,
                duration: 1000,
                ease: 'Power2',
                onUpdate: () => {
                    this.music.setVolume(this.musicVolume);
                }
            });
        }
    }

    private createMainMenu(): void {
        const menuItems = [
            {text: 'START GAME', action: () => this.startGame()},
            {text: 'SETTINGS', action: () => this.openSettings()},
            {text: 'CREDITS', action: () => this.showCredits()},
            {text: 'EXIT', action: () => this.exitGame()}
        ];

        const centerX = this.scale.width / 2;
        const startY = 220;
        const spacing = 50;

        menuItems.forEach((item, index) => {
            const text = this.add.text(
                centerX,
                startY + (index * spacing),
                item.text,
                {
                    fontSize: `${this.getOptimalFontSize()}px`,
                    color: '#FFFFFF'
                }
            ).setOrigin(0.5);

            text.setData('action', item.action);
            this.menuItems.push(text);
        });

        this.highlightSelectedItem();
    }

    private createSettingsMenu(): void {
        this.settingsContainer = this.add.container(this.scale.width + 50, 0);

        const settingsBg = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width - 100,
            this.scale.height - 100,
            0x222222,
            0.95
        ).setStrokeStyle(2, 0x555555);

        this.settingsContainer.add(settingsBg);

        const title = this.add.text(
            this.scale.width / 2,
            150,
            'SETTINGS',
            {
                fontSize: `${this.getOptimalFontSize() + 8}px`,
                color: '#00FF00'
            }
        ).setOrigin(0.5);

        this.settingsContainer.add(title);

        const settingsOptions = [
            {text: `MUSIC: ${this.musicEnabled ? 'ON' : 'OFF'}`, action: () => this.toggleMusic()},
            {text: `SOUND: ${this.soundEnabled ? 'ON' : 'OFF'}`, action: () => this.toggleSound()},
            {text: `MUSIC VOLUME: ${Math.round(this.musicVolume * 100)}%`, action: () => this.adjustMusicVolume()},
            {text: `SOUND VOLUME: ${Math.round(this.soundVolume * 100)}%`, action: () => this.adjustSoundVolume()},
            {text: 'BACK', action: () => this.closeSettings()}
        ];

        const centerX = this.scale.width / 2;
        const startY = 250;
        const spacing = 45;

        settingsOptions.forEach((item, index) => {
            const text = this.add.text(
                centerX,
                startY + (index * spacing),
                item.text,
                {
                    fontSize: `${this.getOptimalFontSize() - 4}px`,
                    color: '#FFFFFF'
                }
            ).setOrigin(0.5);

            text.setData('action', item.action);
            this.settingsItems.push(text);
            this.settingsContainer.add(text);
        });
    }

    private highlightSelectedItem(): void {
        const items = this.isInSettingsMenu ? this.settingsItems : this.menuItems;
        const selectedIndex = this.isInSettingsMenu ? this.selectedSettingsIndex : this.selectedItemIndex;

        items.forEach((item, index) => {
            this.tweens.killTweensOf(item);

            if (index === selectedIndex) {
                item.setColor('#00FF00');
                item.setScale(1.1);

                this.tweens.add({
                    targets: item,
                    scaleX: 1.15,
                    scaleY: 1.15,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                item.setColor('#FFFFFF');
                item.setScale(1.0);
            }
        });
    }

    private playSelectSound(): void {
        // if (this.soundEnabled && this.selectSound) this.selectSound.play();
    }

    private playConfirmSound(): void {
        // if (this.soundEnabled && this.confirmSound) this.confirmSound.play();
    }

    private toggleMusic(): void {
        this.musicEnabled = !this.musicEnabled;
        this.registry.set('musicEnabled', this.musicEnabled);

        if (this.musicEnabled) {
            this.music.play();
            this.tweens.add({
                targets: this.music,
                volume: this.musicVolume,
                duration: 500,
                onUpdate: () => {
                    this.music.setVolume(this.musicVolume);
                }
            });
        } else {
            this.tweens.add({
                targets: this.music,
                volume: 0,
                duration: 500,
                onUpdate: () => {
                    this.music.setVolume(0);
                },
                onComplete: () => this.music.stop()
            });
        }

        this.settingsItems[0].setText(`MUSIC: ${this.musicEnabled ? 'ON' : 'OFF'}`);
        this.playConfirmSound();
    }

    private toggleSound(): void {
        this.soundEnabled = !this.soundEnabled;
        this.registry.set('soundEnabled', this.soundEnabled);

        this.settingsItems[1].setText(`SOUND: ${this.soundEnabled ? 'ON' : 'OFF'}`);
        this.playConfirmSound();
    }

    private adjustMusicVolume(): void {
        this.musicVolume = Math.round((this.musicVolume + 0.1) * 10) / 10;
        if (this.musicVolume > 1) this.musicVolume = 0;

        this.registry.set('musicVolume', this.musicVolume);
        this.music.setVolume(this.musicVolume);

        this.settingsItems[2].setText(`MUSIC VOLUME: ${Math.round(this.musicVolume * 100)}%`);
        this.playConfirmSound();
    }

    private adjustSoundVolume(): void {
        this.soundVolume = Math.round((this.soundVolume + 0.1) * 10) / 10;
        if (this.soundVolume > 1) this.soundVolume = 0;

        this.registry.set('soundVolume', this.soundVolume);
        // if (this.selectSound) this.selectSound.setVolume(this.soundVolume);
        // if (this.confirmSound) this.confirmSound.setVolume(this.soundVolume);

        this.settingsItems[3].setText(`SOUND VOLUME: ${Math.round(this.soundVolume * 100)}%`);
        this.playConfirmSound();
    }

    private openSettings(): void {
        this.isInSettingsMenu = true;
        this.selectedSettingsIndex = 0;
        this.playConfirmSound();

        this.tweens.add({
            targets: this.settingsContainer,
            x: 0,
            duration: 500,
            ease: 'Back.easeOut'
        });

        this.highlightSelectedItem();
    }

    private closeSettings(): void {
        this.isInSettingsMenu = false;
        this.selectedItemIndex = 1;
        this.playConfirmSound();

        this.tweens.add({
            targets: this.settingsContainer,
            x: this.scale.width + 50,
            duration: 500,
            ease: 'Back.easeIn'
        });

        this.highlightSelectedItem();
    }

    private showCredits(): void {
        this.playConfirmSound();

        const creditsContainer = this.add.container(0, 0);
        const creditsBg = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.8
        );

        const creditsText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'SOLITAIRE GAME\n\nDeveloped by: Miguel Cruz\nEngine: Phaser 3\nFont: Better Pixels\n\nPress SPACE to continue',
            {
                fontSize: '24px',
                color: '#FFFFFF',
                align: 'center',
                wordWrap: {width: this.scale.width - 100}
            }
        ).setOrigin(0.5);

        creditsContainer.add([creditsBg, creditsText]);

        this.time.delayedCall(5000, () => {
            creditsContainer.destroy();
        });

        this.input.keyboard?.once('keydown-SPACE', () => {
            creditsContainer.destroy();
        });
    }

    private exitGame(): void {
        this.playConfirmSound();

        this.cameras.main.fadeOut(1000, 0, 0, 0, () => {
            if (typeof window !== 'undefined' && window.close) {
                window.close();
            } else {
                console.log('Game would exit here');
            }
        });
    }

    private startGame(): void {
        this.playConfirmSound();

        this.cameras.main.fadeOut(1000, 0, 0, 0, (camera: any, progress: number) => {
            if (progress === 1) {
                this.scene.start(SCENE_KEYS.GAME);
            }
        });
    }

    private getOptimalFontSize(): number {
        const width = this.scale.width;
        if (width < 600) return 18;
        if (width < 1000) return 24;
        return 36;
    }

    private setupControls(): void {
        this.input.keyboard?.on('keydown-UP', () => {
            if (this.isInSettingsMenu) {
                this.selectedSettingsIndex = Phaser.Math.Wrap(
                    this.selectedSettingsIndex - 1,
                    0,
                    this.settingsItems.length
                );
            } else {
                this.selectedItemIndex = Phaser.Math.Wrap(
                    this.selectedItemIndex - 1,
                    0,
                    this.menuItems.length
                );
            }
            this.highlightSelectedItem();
            this.playSelectSound();
        });

        this.input.keyboard?.on('keydown-DOWN', () => {
            if (this.isInSettingsMenu) {
                this.selectedSettingsIndex = Phaser.Math.Wrap(
                    this.selectedSettingsIndex + 1,
                    0,
                    this.settingsItems.length
                );
            } else {
                this.selectedItemIndex = Phaser.Math.Wrap(
                    this.selectedItemIndex + 1,
                    0,
                    this.menuItems.length
                );
            }
            this.highlightSelectedItem();
            this.playSelectSound();
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            if (this.isInSettingsMenu) {
                this.settingsItems[this.selectedSettingsIndex].getData('action')();
            } else {
                this.menuItems[this.selectedItemIndex].getData('action')();
            }
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.isInSettingsMenu) {
                this.closeSettings();
            }
        });

        this.menuItems.forEach(item => {
            item.setInteractive();
            item.on('pointerover', () => {
                if (!this.isInSettingsMenu) {
                    this.selectedItemIndex = this.menuItems.indexOf(item);
                    this.highlightSelectedItem();
                    this.playSelectSound();
                }
            });
            item.on('pointerdown', () => {
                if (!this.isInSettingsMenu) {
                    item.getData('action')();
                }
            });
        });

        this.settingsItems.forEach(item => {
            item.setInteractive();
            item.on('pointerover', () => {
                if (this.isInSettingsMenu) {
                    this.selectedSettingsIndex = this.settingsItems.indexOf(item);
                    this.highlightSelectedItem();
                    this.playSelectSound();
                }
            });
            item.on('pointerdown', () => {
                if (this.isInSettingsMenu) {
                    item.getData('action')();
                }
            });
        });
    }
}
