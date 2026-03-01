import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useList } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { subjectSchema } from '@/lib/schema';
import { Department, Subject } from '@/types';
import { z } from 'zod';

type SubjectFormValues = z.infer<typeof subjectSchema>;

const SubjectsEdit = () => {
  const form = useForm({
    resolver: zodResolver(subjectSchema),
    refineCoreProps: { resource: 'subjects', action: 'edit' },
    defaultValues: { name: '', code: '', description: '', departmentId: undefined },
  });
  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  const { result: deptResult } = useList<Department>({ resource: 'departments', pagination: { pageSize: 200 } });
  const departments = deptResult?.data ?? [];

  const onSubmit = async (values: SubjectFormValues & Record<string, unknown>) => {
    try {
      await onFinish(values);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EditView>
      <EditViewHeader resource="subjects" title="Edit Subject" />
      <Card>
        <CardHeader><CardTitle>Subject details</CardTitle></CardHeader>
        <Separator />
        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={control} name="departmentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((d: Department) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name} ({d.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. CS101" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Subject name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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

export default SubjectsEdit;
