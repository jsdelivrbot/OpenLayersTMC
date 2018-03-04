import {
  Component, Directive, EventEmitter, Host, OnDestroy, OnChanges, AfterContentInit,
  Input, Output, ContentChild, SimpleChanges
} from '@angular/core';
import { style } from 'openlayers';
import { FeatureComponent } from './feature.component';

@Directive({
    selector: 'aol-style-icon'
})
export class StyleIconDirective implements OnChanges {

    // For usage info see: http://openlayers.org/en/latest/apidoc/ol.style.Icon.html
    @Input() anchor: [number, number];
    @Input() anchorXUnits: style.IconAnchorUnits;
    @Input() anchorYUnits: style.IconAnchorUnits;
    @Input() anchorOrigin: style.IconOrigin;
    @Input() color: [number, number, number, number];
    @Input() crossOrigin: style.IconOrigin;
    @Input() img: string;
    @Input() offset: [number, number];
    @Input() offsetOrigin: style.IconOrigin;
    @Input() opacity: number;
    @Input() scale: number;
    @Input() snapToPixel: boolean;
    @Input() rotateWithView: boolean;
    @Input() rotation: number;
    @Input() size: [number, number];
    @Input() imgSize: [number, number];
    @Input() src: string;

    @Output() onChanged = new EventEmitter<any>();

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        this.onChanged.emit(this.src);
    }
}

@Component({
    selector: 'aol-style',
    template: `<ng-content></ng-content>`
})
export class StyleComponent implements OnDestroy, AfterContentInit {
    private _host_: FeatureComponent;
    private childSubscription$: any;

    @ContentChild(StyleIconDirective) iconStyleDirective: StyleIconDirective;

    constructor( @Host() feature: FeatureComponent) {
        console.log('instancing aol-style');
        this._host_ = feature;
    }

    ngAfterContentInit() {
        this.update();
        this.childSubscription$ = this.iconStyleDirective.onChanged.subscribe((): void => {
            this.update();
        });
    }

    update() {
        this._host_.setStyle(new style.Style({
            image: new style.Icon({
                anchor: this.iconStyleDirective.anchor,
                anchorOrigin: this.iconStyleDirective.anchorOrigin,
                anchorXUnits: this.iconStyleDirective.anchorXUnits,
                anchorYUnits: this.iconStyleDirective.anchorYUnits,
                color: this.iconStyleDirective.color,
                crossOrigin: this.iconStyleDirective.crossOrigin,
                img: this.iconStyleDirective.img,
                offset: this.iconStyleDirective.offset,
                offsetOrigin: this.iconStyleDirective.offsetOrigin,
                opacity: this.iconStyleDirective.opacity,
                scale: this.iconStyleDirective.scale,
                snapToPixel: this.iconStyleDirective.snapToPixel,
                rotateWithView: this.iconStyleDirective.rotateWithView,
                rotation: this.iconStyleDirective.rotation,
                size: this.iconStyleDirective.size,
                imgSize: this.iconStyleDirective.imgSize,
                src: this.iconStyleDirective.src
            })
        }));
    }

    ngOnDestroy() {
        this.childSubscription$.unsubscribe();
    }
}
