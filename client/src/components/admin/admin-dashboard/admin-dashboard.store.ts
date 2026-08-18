import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { AdminFacade } from '../../../app/facades/admin.facade';
import { NotificationService } from '../../../app/services/notification.service';
import type {
  AdminDashboardData,
  AdminDocument,
  AdminQueue,
  AdminRegistration,
} from '../../../app/types/admin.type';

type AdminDashboardState = {
  dashboard: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  confirmation: ConfirmationState | null;
  busyRegistrationId: number | null;
};

type ConfirmationState = {
  kind: 'override' | 'remove';
  registrationId: number;
  parentFullName: string;
};

export const AdminDashboardStore = signalStore(
  withState<AdminDashboardState>({
    dashboard: null,
    loading: false,
    error: null,
    confirmation: null,
    busyRegistrationId: null,
  }),
  withProps(() => ({
    adminFacade: inject(AdminFacade),
    notifications: inject(NotificationService),
  })),
  withComputed(({ dashboard, error }) => {
    const waitingForDocumentsRegistrations = computed(() =>
      dashboard()?.registrations.filter((registration) => registration.status === 'WaitingForDocuments') ?? [],
    );
    const pendingApprovalRegistrations = computed(() =>
      dashboard()?.registrations.filter((registration) => registration.status === 'PendingApproval') ?? [],
    );

    return {
      hasError: computed(() => error() !== null),
      waitingForDocumentsRegistrations,
      pendingApprovalRegistrations,
      metrics: computed(() => {
        const currentDashboard = dashboard();
        if (!currentDashboard) return [];

        return [
          {
            label: 'סה״כ הרשמות',
            value: currentDashboard.totalRegistrations.toString(),
            detail: `לשנת ${currentDashboard.activeYear}`,
            icon: 'lucideClipboardList',
            tone: 'brand',
            leftToRight: false,
          },
          {
            label: 'ממתינות לאישור',
            value: pendingApprovalRegistrations().length.toString(),
            detail: 'דורשות טיפול מנהל',
            icon: 'lucideBadgeCheck',
            tone: 'warning',
            leftToRight: false,
          },
          {
            label: 'ממתינות למסמכים',
            value: waitingForDocumentsRegistrations().length.toString(),
            detail: 'העלאות שטרם הושלמו',
            icon: 'lucideClock3',
            tone: 'warning',
            leftToRight: false,
          },
          {
            label: 'תפוסת ילדים',
            value: `${currentDashboard.registeredChildren} / ${currentDashboard.maxChildCapacity}`,
            detail: `${Math.max(0, currentDashboard.maxChildCapacity - currentDashboard.registeredChildren)} מקומות נותרו`,
            icon: 'lucideUsersRound',
            tone: 'success',
            leftToRight: true,
          },
        ];
      }),
    };
  }),
  withMethods((store) => {
    const loadDashboard = async (): Promise<void> => {
      patchState(store, { loading: true, error: null });

      try {
        patchState(store, { dashboard: await store.adminFacade.getDashboard(), loading: false });
      } catch (error) {
        patchState(store, {
          loading: false,
          error: errorMessage(error, 'לא ניתן לטעון את נתוני לוח הניהול.'),
        });
      }
    };

    return {
      load: loadDashboard,
      setRegistrationExpanded(_queue: AdminQueue, registrationId: number, expanded: boolean): void {
        const currentDashboard = store.dashboard();
        if (!currentDashboard) return;

        patchState(store, {
          dashboard: {
            ...currentDashboard,
            registrations: currentDashboard.registrations.map((registration) =>
              registration.registrationId === registrationId ? { ...registration, expanded } : registration,
            ),
          },
        });
      },
      setPaymentMethod(_queue: AdminQueue, registrationId: number, childId: number, isCashOnly: boolean): Promise<void> {
        return runMutation(
          store,
          registrationId,
          () => store.adminFacade.setPaymentMethod({ registrationId, childId, isCashOnly }),
          'אמצעי התשלום עודכן ודרישות המסמכים חושבו מחדש.',
          loadDashboard,
        );
      },
      approveDocument(_queue: AdminQueue, registrationId: number, documentId: number): Promise<void> {
        return runMutation(
          store,
          registrationId,
          () => store.adminFacade.approveDocument({ registrationId, documentId }),
          'המסמך אושר בהצלחה.',
          loadDashboard,
        );
      },
      openDocument(document: AdminDocument): void {
        if (document.fileName) store.notifications.info(`פתיחת ${document.fileName}`);
      },
      requestApproval(queue: AdminQueue, registration: AdminRegistration): void {
        if (queue === 'waitingForDocuments') {
          patchState(store, {
            confirmation: {
              kind: 'override',
              registrationId: registration.registrationId,
              parentFullName: registration.parentFullName,
            },
          });
          return;
        }

        if (!registration.approvalReady) {
          store.notifications.warning('אפשר לאשר את ההרשמה רק לאחר אישור כל המסמכים הרלוונטיים.');
          return;
        }

        void runMutation(
          store,
          registration.registrationId,
          () => store.adminFacade.approveRegistration({ registrationId: registration.registrationId }),
          'ההרשמה אושרה והוסרה מתור העבודה.',
          loadDashboard,
        );
      },
      requestRemoval(_queue: AdminQueue, registration: AdminRegistration): void {
        patchState(store, {
          confirmation: {
            kind: 'remove',
            registrationId: registration.registrationId,
            parentFullName: registration.parentFullName,
          },
        });
      },
      async confirmAction(): Promise<void> {
        const confirmation = store.confirmation();
        if (!confirmation) return;
        patchState(store, { confirmation: null });

        if (confirmation.kind === 'override') {
          await runMutation(
            store,
            confirmation.registrationId,
            () => store.adminFacade.approveRegistration({ registrationId: confirmation.registrationId }),
            'ההרשמה אושרה והוסרה מתור העבודה.',
            loadDashboard,
          );
          return;
        }

        await runMutation(
          store,
          confirmation.registrationId,
          () => store.adminFacade.removeRegistration({ registrationId: confirmation.registrationId }),
          'ההרשמה הוסרה לצמיתות.',
          loadDashboard,
        );
      },
      dismissConfirmation(): void {
        patchState(store, { confirmation: null });
      },
      documentLabel(type: AdminDocument['type']): string {
        return type === 'SignedContract' ? 'חוזה חתום' : 'אישור הוראת קבע';
      },
      billingLabel(period: AdminRegistration['children'][number]['billingPeriod']): string {
        return period === 'Monthly' ? 'חיוב חודשי' : 'חיוב יומי';
      },
    };
  }),
  withHooks((store) => ({
    onInit(): void {
      void store.load();
    },
  })),
);

async function runMutation(
  store: any,
  registrationId: number,
  operation: () => Promise<unknown>,
  successMessage: string,
  reload: () => Promise<void>,
): Promise<void> {
  if (store.busyRegistrationId() !== null) return;

  patchState(store, { busyRegistrationId: registrationId, error: null });
  try {
    await operation();
    await reload();
    store.notifications.success(successMessage);
  } catch (error) {
    patchState(store, { error: errorMessage(error, 'לא ניתן להשלים את הפעולה.') });
    store.notifications.error(errorMessage(error, 'לא ניתן להשלים את הפעולה.'));
  } finally {
    patchState(store, { busyRegistrationId: null });
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
