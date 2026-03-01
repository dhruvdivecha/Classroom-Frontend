import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useList, useGetIdentity } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { classSchema } from '@/lib/schema';
import UploadWidget from '@/components/upload-widget';
import { Subject, User } from '@/types';
import { z } from 'zod';

const classEditSchema = classSchema.extend({
  bannerUrl: z.string().optional(),
  bannerCldPubId: z.string().optional(),
  description: z.string().optional(),
});

const ClassesEdit = () => {
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || 'student';
  const isTeacher = userRole === 'teacher';

  const form = useForm({
    resolver: zodResolver(classEditSchema),
    refineCoreProps: { resource: 'classes', action: 'edit' },
    defaultValues: { status: 'active' },
  });
  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;
  const bannerPublicId = form.watch('bannerCldPubId');

  const { result: subjectsResult } = useList<Subject>({ resource: 'subjects', pagination: { pageSize: 100 } });
  const { query: teachersQuery } = useList<User>({ resource: 'users', filters: [{ field: 'role', operator: 'eq', value: 'teacher' }], pagination: { pageSize: 100 }, queryOptions: { enabled: !isTeacher } });
  const subjects = subjectsResult?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];

  // Auto-assign teacher when user is a teacher
  useEffect(() => {
    if (isTeacher && identity?.id) {
      form.setValue('teacherId', identity.id as string, { shouldValidate: true });
    }
  }, [isTeacher, identity?.id]);

  const onSubmit = async (values: z.infer<typeof classEditSchema>) => {
    try {
      await onFinish(values);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EditView>
      <EditViewHeader resource="classes" title="Edit Class" />
      <Card>
        <CardHeader><CardTitle>Class details</CardTitle></CardHeader>
        <Separator />
        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={control} name="bannerUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner image</FormLabel>
                  <FormControl>
                    <UploadWidget
                      value={field.value ? { url: field.value, publicId: bannerPublicId ?? '' } : null}
                      onChange={(file) => {
                        if (file) {
                          field.onChange(file.url);
                          form.setValue('bannerCldPubId', file.publicId, { shouldValidate: true });
                        } else {
                          field.onChange('');
                          form.setValue('bannerCldPubId', '', { shouldValidate: true });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Class name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={control} name="subjectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {subjects.map((s: Subject) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="teacherId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher <span className="text-destructive">*</span></FormLabel>
                    {isTeacher ? (
                      <FormControl>
                        <Input value={identity?.name || identity?.email || 'You'} disabled className="bg-muted text-foreground" />
                      </FormControl>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Teacher" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {teachers.map((t: User) => <SelectItem key={t.id} value={t.id}>{t.name ?? t.email}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={control} name="capacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Optional" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Separator />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><span>Saving...</span><Loader2 className="ml-2 inline h-4 w-4 animate-spin" /></> : 'Save'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </EditView>
  );
};

export default ClassesEdit;
