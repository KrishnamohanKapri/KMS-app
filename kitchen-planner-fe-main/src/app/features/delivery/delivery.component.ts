import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, Optional, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { NotificationService } from '../../shared/notification.service';
import { environment } from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare module 'leaflet' {
  namespace Routing {
    function waypoint(latLng: L.LatLngExpression, name?: string, options?: any): any;
    function control(options: any): any;
  }
}

const CAR_EMOJI = {
  className: 'emoji-marker',
  html: '<div class="flip-container">&#128663;</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
};

const HOME_EMOJI = {
  className: 'emoji-marker',
  html: '&#127968;',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
};

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnDestroy, AfterViewInit {
  @Input() orderId = '';
  @Input() orderAddress = '';

  private map!: L.Map;
  private routeControl: any = null;
  private locationInterval: any;

  homePosition: L.LatLngExpression = [0, 0];
  driverPosition: L.LatLngExpression = [0, 0];
  markers: L.Marker[] = [];

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    @Optional() public dialogRef?: MatDialogRef<DeliveryComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { orderId: string, orderAddress: string }
  ) {
    if (data) {
      this.orderId = data.orderId;
      this.orderAddress = data.orderAddress;
    }
  }

  ngAfterViewInit() {
    this.getOrderDeliveryAddressCoordinates();
  }

  ngOnDestroy(): void {
    if (this.locationInterval) clearInterval(this.locationInterval);
  }

  private get deliveryLocationUrl(): string {
    return `${environment.apiUrl}/order/delivery-location/${this.orderId}`;
  }

  private getOrderDeliveryAddressCoordinates() {
    const url = `https://nominatim.openstreetmap.org/search?q=${this.orderAddress}&polygon_geojson=1&format=jsonv2`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const homePosition: L.LatLngExpression = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          this.initMap(homePosition);
          this.centerMap();
        } else {
          this.notificationService.show('Could not get delivery address on map.', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        this.notificationService.show('Could not get delivery address on map.', 'error');
      }
    });
  }

  private initMap(homePosition: L.LatLngExpression) {
    this.homePosition = homePosition;

    this.map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // Initialize markers
    this.markers = [
      L.marker(this.driverPosition, { icon: L.divIcon(CAR_EMOJI as any) }).bindPopup('Delivery Driver'),
      L.marker(this.homePosition, { icon: L.divIcon(HOME_EMOJI as any) }).bindPopup('Your Address')
    ];

    this.markers.forEach((m) => m.addTo(this.map));

    setTimeout(() => this.map.invalidateSize(), 100);

    // Add route between driver and home
    this.addOrUpdateRoute();

    // Center control button
    const centerControl = new L.Control({ position: 'topleft' });
    centerControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-control-center leaflet-bar leaflet-custom-bar');
      const a = document.createElement('a');
      a.classList.add('leaflet-control-zoom-out');
      a.href = '#';
      a.title = 'Center Map';
      a.role = 'button';
      a.innerHTML = '&#128205;';
      a.onclick = (e) => { e.preventDefault(); this.centerMap(); };
      div.appendChild(a);
      return div;
    };
    centerControl.addTo(this.map);

    // Start periodic driver location updates
    this.locationInterval = setInterval(() => this.updateLocation(), 5000);
    this.updateLocation(true);
  }

  private updateLocation(centerMap?: boolean) {
    this.http.get<{ data: { location: number[] } }>(this.deliveryLocationUrl).subscribe({
      next: ({ data }) => {
        if (data?.location?.length === 2) {
          this.updateDriverPosition([data.location[0], data.location[1]], centerMap);
        }
      },
      error: (err) => {
        this.notificationService.show(err.message || err.toString(), 'error');
      }
    });
  }

  private updateDriverPosition(driverPosition: L.LatLngExpression, centerMap?: boolean) {
    // Flip car icon if needed
    if ((this.homePosition as any)[1] > (driverPosition as any)[1]) {
      const reversedCar = L.divIcon({ ...CAR_EMOJI, html: '<div class="flip-container mirror">&#128663;</div>' } as any);
      this.markers[0].setIcon(reversedCar);
    }

    // Update driver marker
    this.markers[0].setLatLng(driverPosition);

    this.driverPosition = driverPosition;

    // Update route
    this.addOrUpdateRoute();

    if (centerMap) this.centerMap();
  }

  private addOrUpdateRoute() {
  // Production-safe reference to Routing
  const Routing = (L as any).Routing || ((window as any).L?.Routing);

  if (!Routing) {
    console.error('Leaflet Routing Machine not loaded!');
    return;
  }

  // Remove previous route
  if (this.routeControl) {
    this.map.removeControl(this.routeControl);
    this.routeControl = null;
  }

  // Only add route if positions are valid
  if (
    Array.isArray(this.driverPosition) &&
    Array.isArray(this.homePosition) &&
    (this.driverPosition[0] !== 0 || this.driverPosition[1] !== 0) &&
    (this.homePosition[0] !== 0 || this.homePosition[1] !== 0)
  ) {
    this.routeControl = Routing.control({
      waypoints: [
        L.latLng(this.driverPosition),
        L.latLng(this.homePosition)
      ],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      autoRoute: true,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: '#1976d2', weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      router: new Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(this.map);
    const routingContainer = document.querySelector('.leaflet-routing-container');
    if (routingContainer) {
      (routingContainer as HTMLElement).style.display = 'none';
    }
    this.routeControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      if (route && route.summary) {
        const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
        const durationMin = Math.round(route.summary.totalTime / 60);
        const summaryText = `Distance: ${distanceKm} km | Time: ${durationMin} min`;
        const summaryDiv = document.getElementById('route-summary');
        if (summaryDiv) summaryDiv.textContent = summaryText;
      }
    });

    // Clear summary if no route
    const summaryDiv = document.getElementById('route-summary');
    if (summaryDiv) summaryDiv.textContent = '';
  }
  }


  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map((marker) => marker.getLatLng()));
    this.map.fitBounds(bounds);
  }
}
